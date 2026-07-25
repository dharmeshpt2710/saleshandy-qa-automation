import { AccountType } from '../types';

// One onboarding step is just: a heading we expect to see, and the answer we click.
export interface Step {
  heading: string;
  answer: string;
}

// The onboarding questions for each account type, in order.
//
// This is the ONLY place the three flows differ. The onboarding page object
// simply loops over the right list, which is how we keep one generic flow
// instead of three separate scripts (assignment section 3).
export const onboardingSteps: Record<AccountType, Step[]> = {
  personal: [
    { heading: 'Please select your occupation', answer: 'Freelancer' },
    { heading: 'What is your primary goal for using Saleshandy?', answer: 'Generate Leads for my Business' },
    { heading: 'How would you use Saleshandy?', answer: 'Cold Outreach' },
    { heading: 'How many emails are you likely to send every month?', answer: '0 - 30K' },
    { heading: 'How did you find us?', answer: 'Google' },
  ],
  business: [
    { heading: 'What is your primary goal for using Saleshandy?', answer: 'Generate B2B Leads' },
    { heading: 'Have you used a cold outreach tool like Saleshandy before?', answer: 'No, I have not' },
    { heading: 'How would you use Saleshandy?', answer: 'Cold Outreach' },
    { heading: 'How did you find us?', answer: 'Google' },
  ],
  clients: [
    { heading: 'What type of agency are you?', answer: 'Lead Generation Agency' },
    { heading: 'How many clients do you serve?', answer: '0 - 5' },
    { heading: 'How many emails are you likely to send every month?', answer: '0 - 30K' },
    { heading: 'How did you find us?', answer: 'Google' },
  ],
};
