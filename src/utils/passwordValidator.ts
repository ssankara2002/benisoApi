const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_RULES = [
  {
    test: (pwd: string) => pwd.length >= PASSWORD_MIN_LENGTH,
    message: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`,
  },
  {
    test: (pwd: string) => /[A-Z]/.test(pwd),
    message: 'Le mot de passe doit contenir au moins une lettre majuscule',
  },
  {
    test: (pwd: string) => /[a-z]/.test(pwd),
    message: 'Le mot de passe doit contenir au moins une lettre minuscule',
  },
  {
    test: (pwd: string) => /[0-9]/.test(pwd),
    message: 'Le mot de passe doit contenir au moins un chiffre',
  },
  {
    test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    message: 'Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)',
  },
];

export const validatePassword = (password: string): void => {
  if (!password) {
    throw new Error('Le mot de passe est requis');
  }

  const errors = PASSWORD_RULES.filter(rule => !rule.test(password)).map(rule => rule.message);

  if (errors.length > 0) {
    throw new Error(errors.join('. '));
  }
};
