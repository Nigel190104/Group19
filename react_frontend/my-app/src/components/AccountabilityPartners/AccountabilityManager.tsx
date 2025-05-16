// src/AccountabilityPartners/AccountabilityManager.tsx
import React, { useState } from "react";
import { useAccountabilityStream } from "./AccountabilityStreamProvider";
import { Partner } from "../../AccountabilityUtility";

interface AccountabilityManagerProps {
  onPartnerSelect: (partner: Partner) => void;
  onRefreshHabits: () => void;
}

const AccountabilityManager: React.FC<AccountabilityManagerProps> = ({
  onPartnerSelect,
  onRefreshHabits,
}) => {
  const [newPartnerInput, setNewPartnerInput] = useState<string>("");
  const [addingPartner, setAddingPartner] = useState<boolean>(false);

  // Use the accountability stream context
  const { partners, loading, error, addPartner, removePartner } =
    useAccountabilityStream();

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerInput.trim()) return;

    setAddingPartner(true);

    const success = await addPartner(newPartnerInput);

    if (success) {
      setNewPartnerInput("");
      onRefreshHabits(); // Refresh habits to show new ones from partnership
    }

    setAddingPartner(false);
  };

  const handleRemovePartner = async (partnerId: number) => {
    await removePartner(partnerId);
    onRefreshHabits(); // Refresh habits to reflect removed partnership
  };

  return (
    <div className="accountability-partners-container">
      <h2>Accountability Partners</h2>
      <p className="text-muted mb-3">
        Add partners to see their habits and share yours with them for mutual
        accountability.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <form
        onSubmit={handleAddPartner}
        className="add-partner-form mb-4"
      >
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Partner's username or email"
            value={newPartnerInput}
            onChange={(e) => setNewPartnerInput(e.target.value)}
            disabled={addingPartner}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={addingPartner || !newPartnerInput.trim()}
          >
            {addingPartner ? "Adding..." : "Add Partner"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center">Loading partners...</div>
      ) : partners.length > 0 ? (
        <div className="partners-list">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="partner-card"
            >
              <div className="partner-info">
                <div className="partner-avatar-placeholder">
                  {partner.username.charAt(0).toUpperCase()}
                </div>

                <span className="partner-name">{partner.username}</span>
              </div>
              <div className="partner-actions">
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => onPartnerSelect(partner)}
                >
                  View Habits
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRemovePartner(partner.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted">
          No accountability partners yet. Add someone to get started!
        </div>
      )}
    </div>
  );
};

export default AccountabilityManager;
