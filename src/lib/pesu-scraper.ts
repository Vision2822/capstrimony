import axios, { AxiosInstance, AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const BASE_URL = 'https://www.pesuacademy.com/Academy';
const LOGIN_PAGE_URL = `${BASE_URL}/`;
const AUTH_URL = `${BASE_URL}/j_spring_security_check`;
const PROFILE_URL = `${BASE_URL}/s/studentProfilePESUAdmin`;

export interface PESUProfile {
  prn: string;
  srn: string;
  name: string;
  email: string;
  phone?: string;
  branch: string;
  semester: string;
  section?: string;
  program?: string;
  campus: string;
  campusCode: number;
  photo?: string;
}

export interface PESUAuthResult {
  success: boolean;
  profile?: PESUProfile;
  error?: string;
}

export async function authenticateWithPESU(
  username: string,
  password: string
): Promise<PESUAuthResult> {
  const jar = new CookieJar();
  const client: AxiosInstance = wrapper(
    axios.create({
      jar,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
  );

  try {
    console.log('Fetching login page...');
    const loginPageResponse = await client.get(LOGIN_PAGE_URL);
    const $ = cheerio.load(loginPageResponse.data);
    
    const csrfToken = $('input[name="_csrf"]').val() as string;
    
    if (!csrfToken) {
      return { success: false, error: 'CSRF token not found' };
    }

    console.log('Logging in...');
    const loginResponse = await client.post(
      AUTH_URL,
      new URLSearchParams({
        j_username: username,
        j_password: password,
        _csrf: csrfToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        maxRedirects: 5,
      }
    );

    if (loginResponse.data.includes('Bad credentials')) {
      return { success: false, error: 'Invalid PESU credentials' };
    }

    console.log('Fetching dashboard...');
    const dashboardResponse = await client.get(LOGIN_PAGE_URL);
    const $dash = cheerio.load(dashboardResponse.data);

    const profileCsrfToken = $dash('input[name="_csrf"]').val() as string;
    
    if (!profileCsrfToken) {
      return { success: false, error: 'Profile CSRF token not found' };
    }

    const profile: Partial<PESUProfile> = {};
    
    const nameElement = $dash('.col-md-7.text-center h4.info_header').first();
    const prnElement = $dash('.col-md-7.text-center h5.info_header').first();
    
    if (nameElement.length) {
      profile.name = nameElement.text().trim();
    }
    
    if (prnElement.length) {
      profile.prn = prnElement.text().trim();
      
      const campusMatch = profile.prn.match(/PES(\d)/);
      if (campusMatch) {
        profile.campusCode = parseInt(campusMatch[1]);
        profile.campus = profile.campusCode === 1 ? 'RR Campus' : 'EC Campus';
      }
    }

    const infoText = $dash('.info_text').text();
    const srnMatch = infoText.match(/SRN\s*:\s*(\S+)/);
    if (srnMatch) {
      profile.srn = srnMatch[1];
    }

    console.log('Fetching detailed profile...');
    const profileResponse = await client.get(PROFILE_URL, {
      params: {
        menuId: '670',
        url: 'studentProfilePESUAdmin',
        controllerMode: '6414',
        actionType: '5',
        id: '0',
        selectedData: '0',
        _: Date.now(),
      },
      headers: {
        'X-CSRF-TOKEN': profileCsrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        Referer: `${BASE_URL}/s/studentProfilePESU`,
      },
    });

    const $profile = cheerio.load(profileResponse.data);

    const findNextLabelText = (text: string): string | undefined => {
      const label = $profile('label:contains("' + text + '")');
      if (label.length) {
        const nextLabel = label.next('label');
        if (nextLabel.length) {
          return nextLabel.text().trim();
        }
      }
      return undefined;
    };

    profile.program = findNextLabelText('Program');
    profile.section = findNextLabelText('Section');
    profile.branch = findNextLabelText('Branch') || 'Unknown';
    profile.semester = findNextLabelText('Semester') || '1';

    const emailInput = $profile('input#updateMail');
    if (emailInput.length) {
      profile.email = emailInput.val() as string;
    }

    const phoneInput = $profile('input#updateContact');
    if (phoneInput.length) {
      profile.phone = phoneInput.val() as string;
    }

    const photoImg = $profile('.media-left img');
    if (photoImg.length) {
      const src = photoImg.attr('src');
      if (src && src.includes('base64,')) {
        profile.photo = src;
      }
    }

    if (!profile.prn || !profile.srn || !profile.name) {
      return {
        success: false,
        error: 'Failed to extract required profile data',
      };
    }

    console.log('Profile fetched successfully:', profile.prn);

    return {
      success: true,
      profile: profile as PESUProfile,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('PESU Authentication Error:', axiosError.message);
    
    if (axiosError.code === 'ECONNABORTED') {
      return { success: false, error: 'Connection timeout' };
    }
    
    if (axiosError.response?.status === 401) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    return {
      success: false,
      error: 'Failed to authenticate with PESU Academy',
    };
  }
}