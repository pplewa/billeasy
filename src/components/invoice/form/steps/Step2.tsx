import { useInvoiceContext } from '@/contexts/InvoiceContext';
import { WizardStep } from '../wizard/WizardStep';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

export function Step2() {
  const { form } = useInvoiceContext();
  const t = useTranslations('form.billTo');

  return (
    <WizardStep
      title={t('title')}
      description={t('description', { defaultValue: "Enter your client's details" })}
    >
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="receiver.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder={t('namePlaceholder')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="receiver.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address')}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="receiver.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('city', { defaultValue: 'City' })}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="receiver.zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('zipCode', { defaultValue: 'ZIP Code' })}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="receiver.country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('country', { defaultValue: 'Country' })}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="receiver.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    value={field.value || ''}
                    placeholder={t('emailPlaceholder')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="receiver.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    value={field.value || ''}
                    placeholder={t('phonePlaceholder')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </WizardStep>
  );
}
