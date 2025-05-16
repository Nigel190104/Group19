import BACKEND_BASE_URL from "./Constants";

// ---------------------- Interfaces ---------------------------- //
export interface Partner {
  id: number;
  username: string;
  profile_image?: string;
  email: string;
}

export interface Habit {
  id: number;
  habit_name: string;
  habit_description: string | null;
  habit_colour: string;
  habit_frequency: number;
  completions: Record<string, boolean>;
  streak_count: number;
  last_completed: string | null;
  created_at: string;
  updated_at: string;
  accountability_partner: number | null;
}

// ---------------------- Interfaces ---------------------------- //



// ----------- Utility functions for accountability partners functionality ------------- //

// Get CSRF token from cookies
const getCsrfToken = (): string | null => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return value;
    }
  }
  return null;
};

// Get all accountability partners
export const getAccountabilityPartners = async (): Promise<Partner[]> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}api/accountability/`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to fetch partners: ${response.status} ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching accountability partners:", error);
    throw error;
  }
};

// add partner by username or email
export const addAccountabilityPartner = async (partnerIdentifier: string): Promise<Partner> => {
  const csrfToken = getCsrfToken();
  
  try {
    const response = await fetch(`${BACKEND_BASE_URL}api/accountability/add/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '',
      },
      credentials: 'include',
      body: JSON.stringify({ partner_id: partnerIdentifier }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to add partner: ${response.status} ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error adding accountability partner:", error);
    throw error;
  }
};

// delete an accountability partner
export const removeAccountabilityPartner = async (partnerId: number): Promise<boolean> => {
  const csrfToken = getCsrfToken();
  
  try {
    const response = await fetch(`${BACKEND_BASE_URL}api/accountability/${partnerId}/remove/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to remove partner: ${response.status} ${errorData}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error removing accountability partner:", error);
    throw error;
  }
};

//retrive a partner's habits
export const getPartnerHabits = async (partnerId: number): Promise<Habit[]> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}api/accountability/${partnerId}/habits/`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to fetch partner habits: ${response.status} ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching partner habits:", error);
    throw error;
  }
};

// Copy a partner's habit to user's habits
export const copyPartnerHabit = async (habitId: number): Promise<Habit> => {
  const csrfToken = getCsrfToken();
  
  try {
    const response = await fetch(`${BACKEND_BASE_URL}api/habit-partner/${habitId}/copy/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to copy habit: ${response.status} ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error copying partner habit:", error);
    throw error;
  }
};