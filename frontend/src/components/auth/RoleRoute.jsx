import ProtectedRoute from './ProtectedRoute';

export default function RoleRoute({ children, roles }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}
