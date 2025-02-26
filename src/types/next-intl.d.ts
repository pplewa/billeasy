declare module "next-intl/navigation" {
  export function createLocalizedPathnamesNavigation<
    Pathnames extends Record<string, Record<string, string>>
  >(options: {
    locales: readonly string[];
    pathnames: Pathnames;
    localePrefix?: "always" | "as-needed";
  }): {
    Link: React.ForwardRefExoticComponent<
      Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
        href: keyof Pathnames | (string & {});
        locale?: string;
        children?: React.ReactNode;
      } & React.RefAttributes<HTMLAnchorElement>
    >;
    redirect: (
      path: keyof Pathnames | (string & {}),
      options?: { locale?: string }
    ) => never;
    usePathname: () => string;
    useRouter: () => {
      push: (
        path: keyof Pathnames | (string & {}),
        options?: { locale?: string }
      ) => void;
      replace: (
        path: keyof Pathnames | (string & {}),
        options?: { locale?: string }
      ) => void;
      back: () => void;
      forward: () => void;
      refresh: () => void;
      prefetch: (
        path: keyof Pathnames | (string & {}),
        options?: { locale?: string }
      ) => void;
    };
  };
}
