import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import ActionButton from "../components/ui/ActionButton";
import toast from "react-hot-toast";

function Settings() {
  const [settings, setSettings] = useState({
    societyName: "ParkFair Society",
    cycleDuration: 15,
    outsideCapacity: 4,
    notificationsEnabled: true,
    contactNumber: "",
  });

  const saveSettings = () => {
    localStorage.setItem(
      "parkfair_settings",
      JSON.stringify(settings)
    );

    toast.success(
      "Settings Saved Successfully"
    );
  };

  return (
    <div>

      <PageHeader
        title="Settings"
        subtitle="Manage ParkFair Configuration"
      />

      <div
        className="
          bg-zinc-900/80
          border
          border-zinc-800
          rounded-3xl
          p-6
          space-y-5
        "
      >

        <div>
          <label className="block mb-2">
            Society Name
          </label>

          <input
            type="text"
            value={settings.societyName}
            onChange={(e) =>
              setSettings({
                ...settings,
                societyName:
                  e.target.value,
              })
            }
            className="
              w-full
              bg-zinc-950
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
            "
          />
        </div>

        <div>
          <label className="block mb-2">
            Cycle Duration (Days)
          </label>

          <input
            type="number"
            value={settings.cycleDuration}
            onChange={(e) =>
              setSettings({
                ...settings,
                cycleDuration:
                  Number(
                    e.target.value
                  ),
              })
            }
            className="
              w-full
              bg-zinc-950
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
            "
          />
        </div>

        <div>
          <label className="block mb-2">
            Outside Capacity
          </label>

          <input
            type="number"
            value={
              settings.outsideCapacity
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                outsideCapacity:
                  Number(
                    e.target.value
                  ),
              })
            }
            className="
              w-full
              bg-zinc-950
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
            "
          />
        </div>

        <div>
          <label className="block mb-2">
            Contact Number
          </label>

          <input
            type="text"
            value={settings.contactNumber}
            onChange={(e) =>
              setSettings({
                ...settings,
                contactNumber:
                  e.target.value,
              })
            }
            className="
              w-full
              bg-zinc-950
              border
              border-zinc-700
              rounded-xl
              px-4
              py-3
            "
          />
        </div>

        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <input
            type="checkbox"
            checked={
              settings.notificationsEnabled
            }
            onChange={(e) =>
              setSettings({
                ...settings,
                notificationsEnabled:
                  e.target.checked,
              })
            }
          />

          <label>
            Enable Notifications
          </label>
        </div>

        <ActionButton
          onClick={saveSettings}
        >
          Save Settings
        </ActionButton>

      </div>

    </div>
  );
}

export default Settings;