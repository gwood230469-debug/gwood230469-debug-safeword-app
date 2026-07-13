export const copy = {
  auth: {
    apple: 'Continue with Apple',
    google: 'Continue with Google',
  },
  home: {
    greeting: (firstName: string) => `Good afternoon, ${firstName}`,
    cta: {
      title: 'Verify a call',
      subtitle: 'Someone asking for money or help right now? Check here first.',
    },
    circle: {
      label: 'Your family circle',
    },
    digest: {
      teaser: 'This week: what to watch out for',
    },
  },
  verify: {
    instruction: {
      title: 'Ask them to say your safe word first.',
      body: "Don't say it yourself, even if you're sure it's them.",
    },
    call: {
      button: (name: string) => `Call ${name} directly`,
    },
    loopin: {
      button: 'Loop in someone else',
    },
    footer: "If they can't say the word, hang up. That's okay — it doesn't need an explanation.",
  },
  safeword: {
    instruction: 'Choose a word or short phrase only your family would know.',
    guidance: 'Avoid pet names, birthdays, or anything public on social media.',
    save: 'Save safe word',
    changedNotification: 'Your family safe word was updated.',
  },
  circle: {
    add: 'Add family member',
    addAnother: 'Add another',
    status: {
      invited: 'Invited — waiting',
    },
    resend: 'Resend invite',
  },
  loopin: {
    notification: (name: string) => `${name} thinks they might be on a scam call. Can you help?`,
  },
  onboarding: {
    name: {
      prompt: 'What should we call you?',
    },
    circle: {
      title: 'Create your family circle',
    },
    invite: {
      button: 'Send invite',
    },
    addMembers: {
      title: 'Add family members',
      subtitle: "Add each person one at a time, then send them an invite link however you'd normally message them.",
    },
  },
  settings: {
    changeSafeWord: 'Change safe word',
    manageCircle: 'Manage circle',
    notifications: 'Notification preferences',
    signOut: 'Sign out',
  },
} as const;
