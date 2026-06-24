import { useEffect, useState } from "react";
import api from "../services/api";

import toast from "react-hot-toast";

import PageHeader from "../components/ui/PageHeader";
import ActionButton from "../components/ui/ActionButton";
import Modal from "../components/ui/Modal";

import {
  Building2,
  Search,
  Users,
  Layers3,
  Crown,
  Phone,
  Mail,
} from "lucide-react";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  getThemeClasses,
} from "../utils/theme";

function Flats() {
  const [flats, setFlats] =
    useState([]);

  const [search, setSearch] =
    useState("");

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

  const { theme } =
    useTheme();

  const styles =
    getThemeClasses(theme);

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
      email:
        flat.email || "",
      wing:
        flat.wing || "A",
      floor:
        flat.floor || 1,
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
    )
      return;

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
    flats.filter((flat) => {
      const q =
        search.toLowerCase();

      return (
        flat.flatNumber
          ?.toLowerCase()
          .includes(q) ||
        flat.ownerName
          ?.toLowerCase()
          .includes(q) ||
        flat.contactNumber
          ?.toLowerCase()
          .includes(q) ||
        flat.email
          ?.toLowerCase()
          .includes(q)
      );
    });

  const totalFlats =
    flats.length;

  const occupiedFlats =
    flats.filter(
      (flat) =>
        flat.ownerName
    ).length;

  const wingA =
    flats.filter(
      (flat) =>
        flat.wing === "A"
    ).length;

  const wingB =
    flats.filter(
      (flat) =>
        flat.wing === "B"
    ).length;

  if (loading) {
    return (
      <div
        className="
          min-h-[60vh]
          flex
          items-center
          justify-center
          text-xl
        "
      >
        Loading Residences...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HERO */}

      <div
        className={`
          ${styles.glassCard}
          border
          rounded-3xl
          p-8
          overflow-hidden
          relative
        `}
      >
        <div
          className="
            absolute
            top-0
            right-0
            w-72
            h-72
            bg-red-500/10
            blur-3xl
            rounded-full
          "
        />

        <div className="relative z-10">

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-red-500/10
              border
              border-red-500/20
              text-red-500
              text-sm
              font-medium
            "
          >
            <Building2 size={16} />
            RESIDENT MANAGEMENT
          </div>

          <h1
            className={`
              text-5xl
              lg:text-6xl
              font-black
              mt-6
              ${styles.text}
            `}
          >
            Residences
            <br />
            Command Center
          </h1>

          <p
            className={`
              mt-4
              text-lg
              ${styles.muted}
            `}
          >
            Manage flats,
            residents and
            ownership records.
          </p>

        </div>
      </div>

      {/* STATS */}

      <div
        className="
          grid
          md:grid-cols-2
          xl:grid-cols-4
          gap-6
        "
      >

        <div
          className={`
            ${styles.card}
            border
            rounded-3xl
            p-6
          `}
        >
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>
                Total Flats
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {totalFlats}
              </h2>
            </div>

            <Building2
              className="
                text-red-500
              "
              size={36}
            />
          </div>
        </div>

        <div
          className={`
            ${styles.card}
            border
            rounded-3xl
            p-6
          `}
        >
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>
                Occupied
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {occupiedFlats}
              </h2>
            </div>

            <Users
              className="
                text-green-500
              "
              size={36}
            />
          </div>
        </div>

        <div
          className={`
            ${styles.card}
            border
            rounded-3xl
            p-6
          `}
        >
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>
                Wing A
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {wingA}
              </h2>
            </div>

            <Crown
              className="
                text-yellow-500
              "
              size={36}
            />
          </div>
        </div>

        <div
          className={`
            ${styles.card}
            border
            rounded-3xl
            p-6
          `}
        >
          <div className="flex justify-between">
            <div>
              <p className={styles.muted}>
                Wing B
              </p>

              <h2
                className="
                  text-4xl
                  font-black
                  mt-2
                "
              >
                {wingB}
              </h2>
            </div>

            <Layers3
              className="
                text-blue-500
              "
              size={36}
            />
          </div>
        </div>

      </div>

      {/* SEARCH */}

      <div
        className="
          flex
          flex-col
          lg:flex-row
          gap-4
        "
      >
        <div className="relative flex-1">

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-zinc-500
            "
          />

          <input
            type="text"
            placeholder="Search by flat, owner, phone or email..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className={`
              ${styles.input}
              w-full
              border
              rounded-2xl
              pl-12
              pr-4
              py-3
            `}
          />

        </div>

        <ActionButton
          onClick={
            openAddModal
          }
        >
          Add Residence
        </ActionButton>

      </div>

      {/* DESKTOP TABLE */}

      <div
        className={`
          hidden
          lg:block
          ${styles.table}
          border
          rounded-3xl
          overflow-hidden
        `}
      >
        <table className="w-full">

          <thead>

            <tr
              className={`
                border-b
                ${styles.tableRow}
              `}
            >
              <th className="p-4 text-left">
                Flat
              </th>

              <th className="p-4 text-left">
                Owner
              </th>

              <th className="p-4 text-left">
                Contact
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
                  className={`
                    border-b
                    ${styles.tableRow}
                  `}
                >
                  <td className="p-4 font-bold">
                    {
                      flat.flatNumber
                    }
                  </td>

                  <td className="p-4">
                    {flat.ownerName ||
                      "—"}
                  </td>

                  <td className="p-4">
                    {flat.contactNumber ||
                      "—"}
                  </td>

                  <td className="p-4">
                    {flat.email ||
                      "—"}
                  </td>

                  <td className="p-4">
                    <span
                      className="
                        px-3
                        py-1
                        rounded-full
                        bg-red-500/10
                        text-red-500
                        text-sm
                      "
                    >
                      {flat.wing}
                    </span>
                  </td>

                  <td className="p-4">
                    {
                      flat.floor
                    }
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">

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

                    </div>
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>
      </div>

      {/* MOBILE CARDS */}

      <div
        className="
          lg:hidden
          grid
          gap-4
        "
      >
        {filteredFlats.map(
          (flat) => (
            <div
              key={flat._id}
              className={`
                ${styles.card}
                border
                rounded-3xl
                p-5
              `}
            >
              <div className="flex justify-between">

                <div>

                  <h3
                    className="
                      text-2xl
                      font-black
                    "
                  >
                    {
                      flat.flatNumber
                    }
                  </h3>

                  <p
                    className={
                      styles.muted
                    }
                  >
                    Wing {
                      flat.wing
                    }
                  </p>

                </div>

                <span
                  className="
                    px-3
                    py-1
                    rounded-full
                    bg-red-500/10
                    text-red-500
                    h-fit
                  "
                >
                  Floor{" "}
                  {
                    flat.floor
                  }
                </span>

              </div>

              <div className="mt-4 space-y-2">

                <div className="flex items-center gap-2">
                  <Users size={16} />
                  {flat.ownerName ||
                    "No Owner"}
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  {flat.contactNumber ||
                    "No Contact"}
                </div>

                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  {flat.email ||
                    "No Email"}
                </div>

              </div>

              <div className="flex gap-2 mt-5">

                <ActionButton
                  variant="secondary"
                  onClick={() =>
                    openEditModal(
                      flat
                    )
                  }
                  className="flex-1"
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
                  className="flex-1"
                >
                  Delete
                </ActionButton>

              </div>
            </div>
          )
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() =>
          setShowModal(false)
        }
        title={
          editingFlat
            ? "Edit Residence"
            : "Create Residence"
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
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
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
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
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
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
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
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
          />

          <select
            value={
              formData.wing
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                wing:
                  e.target.value,
              })
            }
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
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
            value={
              formData.floor
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                floor: Number(
                  e.target.value
                ),
              })
            }
            className={`
              ${styles.input}
              w-full
              border
              rounded-xl
              px-4
              py-3
            `}
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
                setShowModal(
                  false
                )
              }
            >
              Cancel
            </ActionButton>

            <ActionButton
              onClick={saveFlat}
            >
              {editingFlat
                ? "Update Residence"
                : "Create Residence"}
            </ActionButton>
          </div>

        </div>
      </Modal>

    </div>
  );
}

export default Flats;