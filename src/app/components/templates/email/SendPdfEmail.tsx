// React-email
import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,
  Section,
  Text,
  Img,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

// Variables
import { BASE_URL } from '@/lib/variables';

// Internationalization
import { useTranslations } from 'next-intl';

type SendPdfEmailProps = {
  invoiceNumber: string;
};

export default function SendPdfEmail({ invoiceNumber }: SendPdfEmailProps) {
  const t = useTranslations('emailTemplate.sendPdfEmail');
  const logo = `${BASE_URL}/assets/img/logo.png`;
  
  return (
    <Html>
      <Head />
      <Preview>{t('preview', { invoiceNumber })}</Preview>
      <Tailwind>
        <Body className="bg-gray-100">
          <Container>
            <Section className="bg-white border-black-950 my-10 px-10 py-4 rounded-md">
              <Img src={logo} alt="BillEasy Logo" width={200} height={120} />
              <Heading className="leading-tight">{t('heading')}</Heading>

              <Text>
                {t('body', { invoiceNumber: `#${invoiceNumber}` })}
              </Text>

              <Hr />

              <Text>
                {t('signature')}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
