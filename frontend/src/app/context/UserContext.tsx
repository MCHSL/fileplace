import React, { useEffect, useState } from "react";
import client from "../client";

export type User = {
  id: number;
  username: string;
  root_directory: number;
};

export interface UserContext {
  userLoading: boolean;
  userError: boolean;
  user: User | null;
  refetchUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = React.createContext<UserContext>({} as UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const refetchUser = async () => {
    setUserLoading(true);
    setUserError(false);
    try {
      const { data } = await client.get("/user");
      setUser(data);
      setUserError(false);
    } catch (error) {
      setUserError(true);
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  const logout = () => {
    client.post("/user/logout").then(refetchUser);
  };

  useEffect(() => {
    refetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ userLoading, userError, user, refetchUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => React.useContext(UserContext);
export default useUser;
