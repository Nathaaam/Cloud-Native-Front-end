import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      // Configured in .env (see .env.example)
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,

      loginWith: {
        email: true,
      },
    },
  },
});

export default function CognitoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
