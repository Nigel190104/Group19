/**
 * JournalContainer Component
 *
 * A router-aware container that manages switching between personal and work journals.
 * Acts as the parent component for both journal types in the BetterDays app.
 *
 * Features:
 * - Handles journal type selection (personal or work)
 * - Responds to routing state changes to determine active journal
 * - Provides a consistent toggle mechanism between journal types
 * - Maintains state of the selected journal across navigation
 *
 * This component serves as a wrapper that conditionally renders either the
 * personal Journal or WorkJournal component based on the current selection.
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Journal from "./Journal";
import WorkJournal from "../WorkJournal/WorkJournal";

const JournalContainer: React.FC = () => {
  // Get location object to access router state
  const location = useLocation();

  // Default to personal journal unless state says otherwise
  const [activeJournal, setActiveJournal] = useState<"personal" | "work">(
    (location.state as any)?.journalType === "work" ? "work" : "personal"
  );

  // Listen for changes in router state
  useEffect(() => {
    if ((location.state as any)?.journalType) {
      setActiveJournal((location.state as any).journalType);
    }
  }, [location.state]);

  const handleToggleJournal = (journal: "personal" | "work") => {
    setActiveJournal(journal);
  };

  return (
    <div className="journal-container">
      {activeJournal === "personal" ? (
        <Journal
          activeJournal={activeJournal}
          onToggleJournal={handleToggleJournal}
        />
      ) : (
        <WorkJournal
          activeJournal={activeJournal}
          onToggleJournal={handleToggleJournal}
        />
      )}
    </div>
  );
};

export default JournalContainer;
