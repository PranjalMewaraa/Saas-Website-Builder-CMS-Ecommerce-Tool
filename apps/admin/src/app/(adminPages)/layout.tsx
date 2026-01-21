import ShellGate from "./shell/ShellGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShellGate>{children}</ShellGate>;
}
