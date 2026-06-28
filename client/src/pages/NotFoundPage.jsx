import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ROUTES } from '../constants/routes';

const NotFoundPage = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-8 text-center">
    <h1 className="text-6xl font-extrabold text-foreground">404</h1>
    <p className="text-lg text-muted-foreground">Page not found</p>
    <Link to={ROUTES.HOME}>
      <Button>Go Home</Button>
    </Link>
  </div>
);

export default NotFoundPage;
