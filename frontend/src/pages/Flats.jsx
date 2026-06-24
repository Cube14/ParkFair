import { useEffect, useState } from "react";
import api from "../services/api";

import toast from "react-hot-toast";

import PageHeader from "../components/ui/PageHeader";
import ActionButton from "../components/ui/ActionButton";
import Modal from "../components/ui/Modal";

function Flats() {
  const [flats, setFlats] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  const [editingFlat, setEditingFlat] =
    useState(null);

  const [formData, setFormData] =
    useState({
      flatNumber: "",
      ownerName: "",
      contactNumber: "",
      email: "",
      wing: "A",
      floor: 1,
    });

  useEffect(() => {
    loadFlats();
  }, []);

  const loadFlats = async () => {
    try {
      setLoading(true);

      const res =
        await api.get("/flats");

      setFlats(res.data);
    } catch (error) {
      toast.error(
        "Failed to load flats"
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingFlat(null);

    setFormData({
      flatNumber: "",
      ownerName: "",
      contactNumber: "",
      email: "",
      wing: "A",
      floor: 1,
    });

    setShowModal(true);
  };

  const openEditModal = (
    flat
  ) => {
    setEditingFlat(flat);

    setFormData({
      flatNumber:
        flat.flatNumber || "",
      ownerName:
        flat.ownerName || "",
      contactNumber:
        flat.contactNumber || "",
      email: flat.email || "",
      wing: flat.wing || "A",
      floor: flat.floor || 1,
    });

    setShowModal(true);
  };

  const saveFlat = async () => {
    try {
      if (editingFlat) {
        await api.put(
          `/flats/${editingFlat._id}`,
          formData
        );

        toast.success(
          "Flat Updated"
        );
      } else {
        await api.post(
          "/flats",
          formData
        );

        toast.success(
          "Flat Created"
        );
      }

      setShowModal(false);

      loadFlats();
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Save Failed"
      );
    }
  };

  const deleteFlat = async (
    flatId
  ) => {
    if (
      !window.confirm(
        "Delete this flat?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/flats/${flatId}`
      );

      toast.success(
        "Flat Deleted"
      );

      loadFlats();
    } catch (error) {
      toast.error(
        "Delete Failed"
      );
    }
  };

  const filteredFlats =
    flats.filter((flat) =>
      flat.flatNumber
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  if (loading) {
    return (
      <div>
        Loading Flats...
      </div>
    );
  }

  return (
    <div>

      <PageHeader
        title="Flats Management"
        subtitle="Manage owners and resident information"
      />

      <div
        className="
          flex
          flex-col
          md:flex-row
          gap-4
          mb-8
        "
      >
        <input
          type="text"
          placeholder="Search Flat..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="
            flex-1
            bg-zinc-900
            border
            border-zinc-800
            rounded-xl
            px-4
            py-3
          "
        />

        <ActionButton
          onClick={
            openAddModal
          }
        >
          Add Flat
        </ActionButton>
      </div>

      <div
        className="
          overflow-x-auto
          bg-zinc-900/80
          border
          border-zinc-800
          rounded-3xl
        "
      >
        <table className="w-full">

          <thead>
            <tr
              className="
                border-b
                border-zinc-800
              "
            >
              <th className="p-4 text-left">
                Flat
              </th>

              <th className="p-4 text-left">
                Owner
              </th>

              <th className="p-4 text-left">
                Phone
              </th>

              <th className="p-4 text-left">
                Email
              </th>

              <th className="p-4 text-left">
                Wing
              </th>

              <th className="p-4 text-left">
                Floor
              </th>

              <th className="p-4 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredFlats.map(
              (flat) => (
                <tr
                  key={flat._id}
                  className="
                    border-b
                    border-zinc-800
                  "
                >
                  <td className="p-4">
                    {
                      flat.flatNumber
                    }
                  </td>

                  <td className="p-4">
                    {
                      flat.ownerName
                    }
                  </td>

                  <td className="p-4">
                    {
                      flat.contactNumber
                    }
                  </td>

                  <td className="p-4">
                    {flat.email}
                  </td>

                  <td className="p-4">
                    {flat.wing}
                  </td>

                  <td className="p-4">
                    {flat.floor}
                  </td>

                  <td className="p-4 flex gap-2">

                    <ActionButton
                      variant="secondary"
                      onClick={() =>
                        openEditModal(
                          flat
                        )
                      }
                    >
                      Edit
                    </ActionButton>

                    <ActionButton
                      variant="danger"
                      onClick={() =>
                        deleteFlat(
                          flat._id
                        )
                      }
                    >
                      Delete
                    </ActionButton>

                  </td>
                </tr>
              )
            )}
          </tbody>

        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() =>
          setShowModal(false)
        }
        title={
         editingFlat
            ? "Edit Flat Details"
            : "Create New Flat"
        }
      >
        <div className="space-y-4">

          <input
            type="text"
            placeholder="Flat Number"
            value={
              formData.flatNumber
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                flatNumber:
                  e.target.value,
              })
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          />

          <input
            type="text"
            placeholder="Owner Name"
            value={
              formData.ownerName
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                ownerName:
                  e.target.value,
              })
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={
              formData.contactNumber
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                contactNumber:
                  e.target.value,
              })
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          />

          <input
            type="email"
            placeholder="Email"
            value={
              formData.email
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                email:
                  e.target.value,
              })
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3"
          />
            <select
  value={formData.wing}
  onChange={(e) =>
    setFormData({
      ...formData,
      wing: e.target.value,
    })
  }
  className="
    w-full
    bg-zinc-900
    border
    border-zinc-700
    rounded-xl
    px-4
    py-3
  "
>
  <option value="A">
    A Wing
  </option>

  <option value="B">
    B Wing
  </option>
</select>

            <input
  type="number"
  placeholder="Floor"
  value={formData.floor}
  onChange={(e) =>
    setFormData({
      ...formData,
      floor:
        Number(e.target.value),
    })
  }
  className="
    w-full
    bg-zinc-900
    border
    border-zinc-700
    rounded-xl
    px-4
    py-3
  "
/>
          <div
  className="
    flex
    justify-end
    gap-3
    pt-4
  "
>

  <ActionButton
    variant="secondary"
    onClick={() =>
      setShowModal(false)
    }
  >
    Cancel
  </ActionButton>

  <ActionButton
    onClick={saveFlat}
  >
    {editingFlat
      ? "Update Flat"
      : "Create Flat"}
  </ActionButton>

</div>

        </div>
      </Modal>

    </div>
  );
}

export default Flats;