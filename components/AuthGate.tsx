import React from 'react';
import type { User } from 'firebase/auth';
import App from '../App';

// Mock the User type as we are not using firebase auth anymore.
interface MockUser {
    uid: string;
    displayName: string | null;
    email: string | null;
}

const AuthGate: React.FC = () => {
  // Create a mock user for the demo version of the app.
  const demoUser: MockUser = {
    uid: 'demo-user',
    displayName: 'Demo User',
    email: 'demo@example.com',
  };

  // Directly render the App with the mock user, bypassing authentication.
  return <App user={demoUser as User} />;
};

export default AuthGate;