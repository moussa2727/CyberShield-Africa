// Layout pour les pages admin - force tout le contenu à être dynamique
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
