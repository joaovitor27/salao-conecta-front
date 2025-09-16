import * as React from 'react';
import MuiCard from '@mui/material/Card';
import MuiCardHeader from '@mui/material/CardHeader';
import MuiCardContent from '@mui/material/CardContent';
import MuiCardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { SxProps } from '@mui/system';

interface HtmlPropsWithSx extends React.HTMLAttributes<HTMLDivElement> {
  sx?: SxProps;
}
interface HtmlHeadingPropsWithSx extends React.HTMLAttributes<HTMLHeadingElement> {
  sx?: SxProps;
}
interface HtmlParagraphPropsWithSx extends React.HTMLAttributes<HTMLParagraphElement> {
  sx?: SxProps;
}

const Card = styled(MuiCard)(({ theme }) => ({
  textAlign: 'center',
  transition: 'all 0.3s',
  height: '100%',
  '&:hover': { boxShadow: theme.palette.custom.shadows.elegant, transform: 'translateY(-4px)', cursor: 'pointer' },
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.palette.custom.shadows.card,
}));

const CardHeader = React.forwardRef<HTMLDivElement, HtmlPropsWithSx>(({ className, children, ...props }, ref) => (
  <MuiCardHeader ref={ref} title={children} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 3, ...props.sx }} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, HtmlHeadingPropsWithSx>(({ className, children, ...props }, ref) => (
  <Typography ref={ref as React.ForwardedRef<HTMLHeadingElement>} variant="h3" {...props}>
    {children}
  </Typography>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, HtmlParagraphPropsWithSx>(({ className, children, ...props }, ref) => (
  <Typography ref={ref as React.ForwardedRef<HTMLParagraphElement>} variant="body2" {...props}>
    {children}
  </Typography>
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, HtmlPropsWithSx>(({ className, children, ...props }, ref) => (
  <MuiCardContent ref={ref} sx={{ p: 3, pt: 0, ...props.sx }} {...props}>
    {children}
  </MuiCardContent>
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, HtmlPropsWithSx>(({ className, children, ...props }, ref) => (
  <MuiCardActions ref={ref as React.ForwardedRef<HTMLDivElement>} sx={{ display: 'flex', alignItems: 'center', p: 3, pt: 0, ...props.sx }} {...props}>
    {children}
  </MuiCardActions>
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
