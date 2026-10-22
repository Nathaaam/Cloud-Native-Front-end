import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId:
        import.meta.env.VITE_COGNITO_USER_POOL_ID ||
        "us-east-1_3rNV181z7",
      userPoolClientId:
        import.meta.env
          .VITE_COGNITO_USER_POOL_CLIENT_ID ||
        "2nog8midip8tq00b34c3o263vv",

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