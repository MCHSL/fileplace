import React, { useCallback, useEffect, useState } from "react";
import client from "../client";

export type User = {
  id: number;
  username: string;
  email: string;
  root_directory: number;
  is_staff: boolean;
};

export interface UserContext {
  userLoading: boolean;
  userError: boolean;
  user: User | null;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = React.createContext<UserContext>({} as UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const refetchUser = useCallback(async () => {
    setUserLoading(true);
    setUserError(false);
    setUser(null);

    client
      .get("/user")
      .then((res) => {
        setUser(res.data);
        setUserError(false);
      })
      .catch((err) => {
        setUser(null);
        setUserError(true);
      })
      .finally(() => {
        setUserLoading(false);
      });
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    return client.post("/user/logout").then(refetchUser);
  }, []);

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
