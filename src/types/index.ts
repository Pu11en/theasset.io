export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass' | 'gradient' | 'cta';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

export interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  customSize?: {
    width?: string;
    height?: string;
  };
}

export interface AccordionItemProps {
  title: string;
  content: string;
  isOpen?: boolean;
  onClick?: () => void;
}

export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

export interface TestimonialProps {
  name: string;
  title: string;
  company: string;
  content: string;
  rating: number;
  image?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}