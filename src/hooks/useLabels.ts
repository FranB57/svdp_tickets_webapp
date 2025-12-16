import { useLanguage } from './useLanguage';
import { getLabel, type LabelKey } from '../i18n/labels';

export function useLabels() {
  const { language } = useLanguage();

  const t = (key: LabelKey): string => {
    return getLabel(key, language);
  };

  return { t, language };
}
