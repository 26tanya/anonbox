import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Here&apos;s your verification code: {otp}</Preview>
      <Section style={{ padding: '20px' }}>
        <Heading as="h2">Hello {username},</Heading>

        <Text>
          Thank you for registering. Please use the following verification code to complete your registration:
        </Text>

        <Heading as="h3" style={{ color: '#4D55CC' }}>{otp}</Heading>

        <Text>If you did not request this code, please ignore this email.</Text>
      </Section>
    </Html>
  );
}