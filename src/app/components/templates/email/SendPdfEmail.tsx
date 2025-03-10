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
import { getTranslations } from 'next-intl/server';
import { Locale } from '@/i18n/routing';

type SendPdfEmailProps = {
  invoiceNumber: string;
  customMessage?: string;
  locale?: Locale;
};

export default async function SendPdfEmail({
  invoiceNumber,
  customMessage,
  locale = 'en',
}: SendPdfEmailProps) {
  // Validate locale is one of the supported locales
  const supportedLocales: Locale[] = ['en', 'es', 'fr', 'de', 'pl', 'pt', 'zh'];
  const validLocale = supportedLocales.includes(locale) ? locale : 'en';

  const t = await getTranslations({
    locale: validLocale,
    namespace: 'emailTemplate.sendPdfEmail',
  });

  const logo = `${BASE_URL}/images/logo.png`;

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

              <Text>{t('body', { invoiceNumber: `#${invoiceNumber}` })}</Text>

              {customMessage && <Text className="mt-4 italic">{customMessage}</Text>}

              <Hr />

              <Text>{t('signature')}</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
