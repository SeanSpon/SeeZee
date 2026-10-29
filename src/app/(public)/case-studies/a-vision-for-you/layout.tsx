import { generatePageMetadata } from '@/lib/metadata'

export const metadata = generatePageMetadata({
  title: 'A Vision For You — Nonprofit Platform Case Study',
  description:
    'Case study: the donation system, program intake, meeting RSVPs and staff dashboard SeeZee Studio built for A Vision For You, a Louisville, KY 501(c)(3).',
  path: '/case-studies/a-vision-for-you',
})

export default function AvfyLayout({ children }: { children: React.ReactNode }) {
  return children
}
