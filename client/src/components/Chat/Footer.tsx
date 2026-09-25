import React, { useEffect, memo } from 'react';
import TagManager from 'react-gtm-module';
import ReactMarkdown from 'react-markdown';
import { Constants, hasConfiguredFooter } from 'librechat-data-provider';
import type { TStartupConfig } from 'librechat-data-provider';
import { useGetStartupConfig } from '~/data-provider';
import { useLocalize } from '~/hooks';

type FooterProps = {
  className?: string;
  startupConfig?: FooterStartupConfig | null;
  /** A started conversation keeps only what the deployment configured. The
   *  generic model disclaimer belongs to the welcome screen, where it is first
   *  read, but a custom footer, a privacy policy and terms of service are the
   *  operator's own content: scoping the disclaimer out must not take their
   *  configuration off the screen that used to carry it. With nothing
   *  configured, this renders nothing at all. */
  configuredOnly?: boolean;
};

type FooterStartupConfig = Pick<Partial<TStartupConfig>, 'analyticsGtmId' | 'customFooter'> & {
  interface?: Pick<NonNullable<TStartupConfig['interface']>, 'privacyPolicy' | 'termsOfService'>;
};

function Footer({ className, startupConfig }: FooterProps) {
  // const shouldFetchConfig = startupConfig === undefined;
  // const { data: fetchedConfig } = useGetStartupConfig({ enabled: shouldFetchConfig });
  // const config = shouldFetchConfig ? fetchedConfig : startupConfig;
  // const localize = useLocalize();

  // const privacyPolicy = config?.interface?.privacyPolicy;
  // const termsOfService = config?.interface?.termsOfService;

  // const privacyPolicyRender = privacyPolicy?.externalUrl != null && (
  //   <a className="text-text-secondary underline" href={privacyPolicy.externalUrl} rel="noreferrer">
  //     {localize('com_ui_privacy_policy')}
  //   </a>
  // );

  // const termsOfServiceRender = termsOfService?.externalUrl != null && (
  //   <a className="text-text-secondary underline" href={termsOfService.externalUrl} rel="noreferrer">
  //     {localize('com_ui_terms_of_service')}
  //   </a>
  // );

  // const mainContentParts = (
  //   typeof config?.customFooter === 'string'
  //     ? config.customFooter: ""

  // ).split('|');

  // useEffect(() => {
  //   if (config?.analyticsGtmId != null && typeof window.google_tag_manager === 'undefined') {
  //     const tagManagerArgs = {
  //       gtmId: config.analyticsGtmId,
  //     };
  //     TagManager.initialize(tagManagerArgs);
  //   }
  // }, [config?.analyticsGtmId]);

  // const mainContentRender = mainContentParts.map((text, index) => (
  //   <React.Fragment key={`main-content-part-${index}`}>
  //     <ReactMarkdown
  //       components={{
  //         a: ({ node: _n, href, children, ...otherProps }) => {
  //           return (
  //             <a
  //               className="text-text-secondary underline"
  //               href={href}
  //               rel="noreferrer"
  //               {...otherProps}
  //             >
  //               {children}
  //             </a>
  //           );
  //         },

  //         p: ({ node: _n, ...props }) => <span {...props} />,
  //       }}
  //     >
  //       {text.trim()}
  //     </ReactMarkdown>
  //   </React.Fragment>
  // ));

  // const footerElements = [...mainContentRender, privacyPolicyRender, termsOfServiceRender].filter(
  //   Boolean,
  // );

  return null;
}

const MemoizedFooter = memo(Footer);
MemoizedFooter.displayName = 'Footer';

export default MemoizedFooter;
