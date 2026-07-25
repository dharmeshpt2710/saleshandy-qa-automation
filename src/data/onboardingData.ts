import { AccountType } from '../types';

// One onboarding step: the heading we expect, every option shown (asserted
// visible), and the one we click. Clicking the answer usually auto-advances;
// set needsNext for steps that require the forward arrow instead.
export interface Step {
  heading: string;
  options: string[];
  answer: string;
  needsNext?: boolean;
}

/**
 * Onboarding questions per account type, in order. This is the only place the
 * three flows actually differ, the page object just loops over the right list,
 * which is how we keep one generic flow instead of three separate scripts.
 */
// Option lists shared across flows, so a wording change is a one-place edit.
const USAGE = ['Cold outreach', 'Lead finder', 'Find leads and cold outreach'];
const EMAIL_VOLUME = ['0 - 30K', '30K - 100K', '100K - 250K', 'More than 250K'];
// The clickable choices only; the "Other, write here.." free-text field is not asserted.
const FIND_US = ['LinkedIn', 'Blog', 'Google', 'Ads', 'YouTube', 'Recommendation'];

export const onboardingSteps: Record<AccountType, Step[]> = {
  personal: [
    {
      heading: 'Please select your occupation',
      options: ['Freelancer', 'Influencer', 'Consultant-Advisor', 'Other'],
      answer: 'Freelancer',
    },
    {
      heading: 'What is your primary goal for using Saleshandy?',
      options: ['Generate Leads for my Business', 'Engage with Prospects', 'One-time Email Outreach', 'Recruit Talent', 'Other'],
      answer: 'Generate Leads for my Business',
    },
    { heading: 'How would you use Saleshandy?', options: USAGE, answer: 'Cold outreach' },
    { heading: 'How many emails are you likely to send every month?', options: EMAIL_VOLUME, answer: '0 - 30K' },
    { heading: 'How did you find us?', options: FIND_US, answer: 'Google' },
  ],
  business: [
    {
      heading: 'What is your primary goal for using Saleshandy?',
      options: ['Generate B2B Leads', 'Book Meetings', 'Promote Products / Services', 'One-time Email Outreach', 'Outreach Candidates', 'Link Building', 'Other'],
      answer: 'Generate B2B Leads',
    },
    {
      heading: 'Have you used a cold outreach tool like Saleshandy before?',
      options: ['Yes, I have', 'No, I have not', 'Not exactly, but I use an email marketing tool'],
      answer: 'No, I have not',
    },
    { heading: 'How would you use Saleshandy?', options: USAGE, answer: 'Cold outreach' },
    { heading: 'How did you find us?', options: FIND_US, answer: 'Google' },
  ],
  clients: [
    {
      heading: 'What type of agency are you?',
      options: ['Lead Generation Agency', 'Sales Agency', 'Digital Marketing Agency', 'Social Media Agency', 'Recruitment Agency', 'Other'],
      answer: 'Lead Generation Agency',
    },
    {
      heading: 'How many clients do you serve?',
      options: ['0 - 5', '6 - 20', '21 - 50', 'More than 50'],
      answer: '0 - 5',
    },
    { heading: 'How many emails are you likely to send every month?', options: EMAIL_VOLUME, answer: '0 - 30K' },
    { heading: 'How did you find us?', options: FIND_US, answer: 'Google' },
  ],
};
