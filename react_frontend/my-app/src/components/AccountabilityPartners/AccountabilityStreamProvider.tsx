// src/AccountabilityPartners/AccountabilityStreamProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Partner, Habit } from "../../AccountabilityUtility";
import BACKEND_BASE_URL from "../../Constants";

interface AccountabilityStreamContextType {
  partners: Partner[];
  loading: boolean;
  connected: boolean;
  error: string | null;
  lastHabitUpdate: string | null;
  addPartner: (partnerIdentifier: string) => Promise<boolean>;
  removePartner: (partnerId: number) => Promise<boolean>;
  getPartnerHabits: (partnerId: number) => Promise<Habit[]>;
  copyHabit: (habitId: number) => Promise<Habit | null>;
}

const defaultContextValue: AccountabilityStreamContextType = {
  partners: [],
  loading: true,
  connected: false,
  error: null,
  lastHabitUpdate: null,
  addPartner: async () => false,
  removePartner: async () => false,
  getPartnerHabits: async () => [],
  copyHabit: async () => null,
};

const AccountabilityStreamContext =
  createContext<AccountabilityStreamContextType>(defaultContextValue);

export const useAccountabilityStream = () =>
  useContext(AccountabilityStreamContext);

interface AccountabilityStreamProviderProps {
  children: ReactNode;
}

export const AccountabilityStreamProvider: React.FC<
  AccountabilityStreamProviderProps
> = ({ children }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [lastHabitUpdate, setLastHabitUpdate] = useState<string | null>(null);

  // Helper function to create headers
  const createHeaders = (
    includeContentType: boolean = false
  ): Record<string, string> => {
    const headers: Record<string, string> = {};
    const cookies = document.cookie.split(";");
    let csrfToken = null;

    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrftoken") {
        csrfToken = value;
        break;
      }
    }

    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }

    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  // Setup SSE connection
  useEffect(() => {
    let es: EventSource | null = null;

    const setupConnection = () => {
      // Close existing connection if any
      if (es) {
        es.close();
      }

      setLoading(true);
      setError(null);

      // Create new EventSource connection to your backend endpoint
      es = new EventSource(`${BACKEND_BASE_URL}api/accountability-stream/`, {
        withCredentials: true,
      });
      setEventSource(es);

      // Handle connection open
      es.onopen = () => {
        setConnected(true);
        console.log("SSE connection established");
      };

      // Handle initial partners data
      es.addEventListener("initial_partners", (event) => {
        try {
          const data = JSON.parse(event.data) as Partner[];
          setPartners(data);
          setLoading(false);
        } catch (e) {
          console.error("Error parsing initial partners data:", e);
          setError("Failed to load partners data");
          setLoading(false);
        }
      });

      // Handle partner updates
      es.addEventListener("partners_update", (event) => {
        try {
          const data = JSON.parse(event.data) as Partner[];
          setPartners(data);
        } catch (e) {
          console.error("Error parsing partners update:", e);
        }
      });

      // Handle habit updates
      es.addEventListener("habit_update", (event) => {
        try {
          console.log("Received habit update event:", event.data);
          const data = JSON.parse(event.data);

          // Simply broadcast that habits have been updated
          setLastHabitUpdate(new Date().toISOString());
        } catch (e) {
          console.error("Error parsing habit update:", e);
        }
      });

      // Handle errors
      es.onerror = (error) => {
        console.error("SSE connection error:", error);
        setError("Connection error");
        setConnected(false);

        // Attempt to reconnect after delay
        setTimeout(() => {
          setupConnection();
        }, 5000);
      };
    };

    setupConnection();

    // Cleanup on unmount
    return () => {
      if (es) {
        es.close();
      }
    };
  }, []);

  // Methods to interact with partners
  const addPartner = async (partnerIdentifier: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}api/accountability/add/`,
        {
          method: "POST",
          headers: createHeaders(true),
          body: JSON.stringify({ partner_id: partnerIdentifier }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add partner");
      }

      // The SSE stream will handle updating the partners state
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
      return false;
    }
  };

  const removePartner = async (partnerId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}api/accountability/${partnerId}/remove/`,
        {
          method: "DELETE",
          headers: createHeaders(),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove partner");
      }

      // The SSE stream will handle updating the partners state
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
      return false;
    }
  };

  const getPartnerHabits = async (partnerId: number): Promise<Habit[]> => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}api/accountability/${partnerId}/habits/`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get partner habits");
      }

      return (await response.json()) as Habit[];
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
      return [];
    }
  };

  const copyHabit = async (habitId: number): Promise<Habit | null> => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}api/habit-partner/${habitId}/copy/`,
        {
          method: "POST",
          headers: createHeaders(true),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to copy habit");
      }

      return (await response.json()) as Habit;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
      return null;
    }
  };

  // Value to provide through context
  const value: AccountabilityStreamContextType = {
    partners,
    loading,
    connected,
    error,
    lastHabitUpdate,
    addPartner,
    removePartner,
    getPartnerHabits,
    copyHabit,
  };

  return (
    <AccountabilityStreamContext.Provider value={value}>
      {children}
    </AccountabilityStreamContext.Provider>
  );
};
