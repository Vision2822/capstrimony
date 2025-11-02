'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Welcome', 'Skills', 'Preferences', 'Availability', 'Links'];
const MIN_BIO_LENGTH = 10;
const MAX_BIO_LENGTH = 500;

const SKILLS = [
  { value: 'JAVASCRIPT', label: 'JavaScript' },
  { value: 'TYPESCRIPT', label: 'TypeScript' },
  { value: 'PYTHON', label: 'Python' },
  { value: 'JAVA', label: 'Java' },
  { value: 'CPP', label: 'C++' },
  { value: 'REACT', label: 'React' },
  { value: 'NEXTJS', label: 'Next.js' },
  { value: 'NODEJS', label: 'Node.js' },
  { value: 'FLUTTER', label: 'Flutter' },
  { value: 'REACT_NATIVE', label: 'React Native' },
  { value: 'SQL', label: 'SQL' },
  { value: 'MONGODB', label: 'MongoDB' },
  { value: 'POSTGRESQL', label: 'PostgreSQL' },
  { value: 'AWS', label: 'AWS' },
  { value: 'DOCKER', label: 'Docker' },
  { value: 'MACHINE_LEARNING', label: 'Machine Learning' },
  { value: 'DEEP_LEARNING', label: 'Deep Learning' },
  { value: 'UI_UX', label: 'UI/UX Design' },
  { value: 'FIGMA', label: 'Figma' },
] as const;

const DOMAINS = [
  { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
  { value: 'MOBILE_DEVELOPMENT', label: 'Mobile Development' },
  { value: 'AI_ML', label: 'AI/ML' },
  { value: 'DATA_SCIENCE', label: 'Data Science' },
  { value: 'BLOCKCHAIN', label: 'Blockchain' },
  { value: 'IOT', label: 'Internet of Things' },
  { value: 'CYBERSECURITY', label: 'Cybersecurity' },
  { value: 'CLOUD_COMPUTING', label: 'Cloud Computing' },
  { value: 'DEVOPS', label: 'DevOps' },
] as const;

const ROLES = [
  { value: 'FRONTEND_DEVELOPER', label: 'Frontend Developer' },
  { value: 'BACKEND_DEVELOPER', label: 'Backend Developer' },
  { value: 'FULL_STACK_DEVELOPER', label: 'Full Stack Developer' },
  { value: 'MOBILE_DEVELOPER', label: 'Mobile Developer' },
  { value: 'UI_UX_DESIGNER', label: 'UI/UX Designer' },
  { value: 'DATA_SCIENTIST', label: 'Data Scientist' },
  { value: 'ML_ENGINEER', label: 'ML Engineer' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager' },
] as const;

const WORKING_STYLES = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'IN_PERSON', label: 'In Person' },
  { value: 'HYBRID', label: 'Hybrid' },
] as const;

const TEAM_SIZES = [2, 3, 4, 5, 6] as const;
const HOURS_CONFIG = { min: 5, max: 40, default: 10 };

type WorkingStyle = typeof WORKING_STYLES[number]['value'];

interface FormData {
  bio: string;
  skills: string[];
  domains: string[];
  preferredRoles: string[];
  preferredTeamSize: number;
  hoursPerWeek: number;
  workingStyle: WorkingStyle;
  willingToLead: boolean;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

function StepIndicator({ 
  currentStep, 
  totalSteps, 
  labels 
}: {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        {labels.map((label, index) => (
          <div
            key={label}
            className={`text-xs font-medium transition-colors ${
              index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-2 rounded-full transition-all duration-300 ${
              index + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SelectionGrid({ 
  items, 
  selected, 
  onToggle, 
  columns = 3 
}: {
  items: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: 2 | 3;
}) {
  return (
    <div className={`grid ${columns === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'} gap-3`}>
      {items.map(item => {
        const isSelected = selected.includes(item.value);
        return (
          <div
            key={item.value}
            onClick={() => onToggle(item.value)}
            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
              isSelected
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'hover:bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.label}</span>
              {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    bio: '',
    skills: [],
    domains: [],
    preferredRoles: [],
    preferredTeamSize: 4,
    hoursPerWeek: HOURS_CONFIG.default,
    workingStyle: 'HYBRID',
    willingToLead: false,
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
  });

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        const res = await fetch('/api/onboarding');
        const data = await res.json();
        
        if (data && !data.error) {
          setFormData(prev => ({
            ...prev,
            ...data,
            skills: data.skills ?? [],
            domains: data.domains ?? [],
            preferredRoles: data.preferredRoles ?? [],
          }));
        }
      } catch (error) {
        console.error('Failed to fetch onboarding data:', error);
        toast.error('Failed to load your profile data');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchOnboardingData();
  }, []);

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (formData.bio.length > 0 && formData.bio.length < MIN_BIO_LENGTH) {
          toast.error(`Bio must be at least ${MIN_BIO_LENGTH} characters`);
          return false;
        }
        return true;
      case 2:
        if (formData.skills.length === 0) {
          toast.error('Please select at least one skill');
          return false;
        }
        return true;
      case 5:
        const urls = [formData.githubUrl, formData.linkedinUrl, formData.portfolioUrl];
        const urlPattern = /^https?:\/\/.+/i;
        for (const url of urls) {
          if (url && !urlPattern.test(url)) {
            toast.error('Please enter valid URLs (starting with http:// or https://)');
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const saveProgress = async () => {
    try {
      const res = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save');
      }
      
      return data;
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save progress');
      throw error;
    }
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (currentStep < TOTAL_STEPS) {
      setLoading(true);
      try {
        await saveProgress();
        setCurrentStep(prev => prev + 1);
      } catch (error) {
        console.error('Save error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const result = await saveProgress();
        
        if (result.onboardingComplete) {
          toast.success("Profile complete! Let's find your teammates!");
        } else {
          toast.success('Profile saved! You can complete it anytime.');
        }
        
        router.push('/dashboard');
      } catch{
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleSelection = (field: keyof Pick<FormData, 'skills' | 'domains' | 'preferredRoles'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-2xl pt-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Help us match you with the perfect teammates
            </CardDescription>
            <StepIndicator 
              currentStep={currentStep} 
              totalSteps={TOTAL_STEPS} 
              labels={STEP_LABELS} 
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <StepHeader
                    title="Welcome to Capstrimony! 👋"
                    description="Let's start by telling others a bit about yourself."
                  />
                  <div>
                    <Label htmlFor="bio">Your Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="I'm passionate about building scalable web applications..."
                      value={formData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      className="mt-2 h-32"
                      maxLength={MAX_BIO_LENGTH}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.bio.length}/{MAX_BIO_LENGTH} characters
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <StepHeader
                    title="Your Technical Skills 💻"
                    description="Select all the technologies you're comfortable with."
                  />
                  <SelectionGrid
                    items={SKILLS}
                    selected={formData.skills}
                    onToggle={(value) => toggleSelection('skills', value)}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <StepHeader
                    title="Project Preferences 🎯"
                    description="What kind of projects interest you?"
                  />
                  
                  <div>
                    <Label>Preferred Domains</Label>
                    <div className="mt-2">
                      <SelectionGrid
                        items={DOMAINS}
                        selected={formData.domains}
                        onToggle={(value) => toggleSelection('domains', value)}
                        columns={2}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Preferred Roles</Label>
                    <div className="mt-2">
                      <SelectionGrid
                        items={ROLES}
                        selected={formData.preferredRoles}
                        onToggle={(value) => toggleSelection('preferredRoles', value)}
                        columns={2}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Preferred Team Size</Label>
                    <div className="flex gap-2 mt-2">
                      {TEAM_SIZES.map(size => (
                        <Button
                          key={size}
                          variant={formData.preferredTeamSize === size ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateField('preferredTeamSize', size)}
                          type="button"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <StepHeader
                    title="Your Availability ⏰"
                    description="How much time can you dedicate to the project?"
                  />
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Hours per Week</Label>
                      <span className="text-sm font-medium text-blue-600">
                        {formData.hoursPerWeek === HOURS_CONFIG.max 
                          ? `${HOURS_CONFIG.max}+` 
                          : formData.hoursPerWeek} hours/week
                      </span>
                    </div>
                    <input
                      type="range"
                      min={HOURS_CONFIG.min}
                      max={HOURS_CONFIG.max}
                      step={5}
                      value={formData.hoursPerWeek}
                      onChange={(e) => updateField('hoursPerWeek', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      {Array.from(
                        { length: (HOURS_CONFIG.max - HOURS_CONFIG.min) / 5 + 1 }, 
                        (_, i) => HOURS_CONFIG.min + i * 5
                      ).map(hour => (
                        <span key={hour}>
                          {hour === HOURS_CONFIG.max ? `${hour}+` : hour}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Working Style</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {WORKING_STYLES.map(style => (
                        <Button
                          key={style.value}
                          variant={formData.workingStyle === style.value ? 'default' : 'outline'}
                          onClick={() => updateField('workingStyle', style.value)}
                          type="button"
                        >
                          {style.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lead"
                      checked={formData.willingToLead}
                      onCheckedChange={(checked) => updateField('willingToLead', checked as boolean)}
                    />
                    <Label htmlFor="lead" className="text-sm font-medium cursor-pointer">
                      I&apos;m willing to be a team leader
                    </Label>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <StepHeader
                    title="Connect Your Profiles 🔗"
                    description="Share your work and connect with teammates (optional)."
                  />
                  
                  <div>
                    <Label htmlFor="github">GitHub Profile</Label>
                    <Input
                      id="github"
                      type="url"
                      placeholder="https://github.com/yourusername"
                      value={formData.githubUrl}
                      onChange={(e) => updateField('githubUrl', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/yourusername"
                      value={formData.linkedinUrl}
                      onChange={(e) => updateField('linkedinUrl', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="portfolio">Portfolio Website</Label>
                    <Input
                      id="portfolio"
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={formData.portfolioUrl}
                      onChange={(e) => updateField('portfolioUrl', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || loading}
                type="button"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={loading}
                type="button"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : currentStep === TOTAL_STEPS ? (
                  'Complete Profile'
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}