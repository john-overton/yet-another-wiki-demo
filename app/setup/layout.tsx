import '../globals.css'
import '../markdown.css'
import { Providers } from '../components/Providers'
import '../lib/editorConfig'

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      {children}
    </Providers>
  );
}
