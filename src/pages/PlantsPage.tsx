import React, { useEffect, useRef, useState } from "react";
import {
  getPlants,
  createPlant,
  updatePlant,
  deletePlant,
} from "../services/plantService";
import { Plant } from "../interfaces/Plant";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PlantsPage: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    scale: 1.5,
    widthUnits: 500,
    heightUnits: 500,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpenId(null);
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const fetchPlants = async () => {
    try {
      const data = await getPlants();
      setPlants(data);
    } catch (err) {
      setError("Failed to fetch plants");
      toast.error("Error fetching plants");
    } finally {
      setLoading(false);
    }
  };

  const handlePlantClick = (plantId: string) => {
    navigate(`/plants/${plantId}/blueprint`);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      scale: 1.5,
      widthUnits: 500,
      heightUnits: 500,
    });

    setEditingPlant(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (plant: Plant) => {
    setEditingPlant(plant);

    setFormData({
      name: plant.name,
      description: plant.description,
      scale: plant.scale,
      widthUnits: plant.widthUnits,
      heightUnits: plant.heightUnits,
    });

    setIsModalOpen(true);
  };

  const handleSavePlant = async () => {
    try {
      setCreating(true);

      if (editingPlant) {
        await updatePlant(editingPlant.id, formData);

        setPlants((prev) =>
          prev.map((plant) =>
            plant.id === editingPlant.id
              ? {
                  ...plant,
                  ...formData,
                }
              : plant
          )
        );

        setIsModalOpen(false);
        resetForm();
        toast.success(`Plant "${formData.name}" has been successfully updated.`);

        return;
      }

      const newPlant = await createPlant(formData);

      setPlants((prev) => [...prev, newPlant]);

      setIsModalOpen(false);

      toast.success(`Plant "${newPlant.name}" has been successfully created.`);

      navigate(`/plants/${newPlant.id}/blueprint`);
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred while saving the plant.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlant = (plant: Plant) => {
    setSelectedPlant(plant);
    setDeleteModalOpen(true);
  };

  const confirmDeletePlant = async () => {
    if (!selectedPlant) return;

    try {
      await deletePlant(selectedPlant.id);

      setPlants((prev) =>
        prev.filter((p) => p.id !== selectedPlant.id)
      );

      setDeleteModalOpen(false);
      toast.success(`The plant "${selectedPlant.name}" has been deleted.`);
      setSelectedPlant(null);
    } catch (error) {
      console.error(error);
      toast.error("Could not delete the plant. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:18px_18px]" />

      {/* Ambient Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] bg-blue-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-cyan-400/10 blur-[120px] rounded-full" />

      <div className="relative z-10 px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">
              Industrial Plants
            </h1>

            <p className="text-gray-400 mt-2">
              Monitor and manage industrial environments in real time
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="
              flex items-center gap-2
              px-5 py-3
              rounded-2xl
              bg-blue-500
              hover:bg-blue-400
              transition-all duration-200
              shadow-[0_0_30px_rgba(59,130,246,0.25)]
              border border-blue-400/20
            "
          >
            <span className="material-symbols-outlined">add</span>
            New Plant
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-[400px]">
            <div className="w-10 h-10 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl p-4">
            {error}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => handlePlantClick(plant.id)}
                className="
                  relative
                  group
                  cursor-pointer
                  rounded-3xl
                  border border-white/10
                  bg-white/[0.03]
                  backdrop-blur-xl
                  p-6
                  hover:border-blue-400/30
                  hover:bg-blue-500/[0.04]
                  transition-all duration-300
                  hover:-translate-y-1
                "
              >
                {/* Menu */}
                <div
                  className="absolute top-5 right-5 z-20"
                  onClick={(e) => e.stopPropagation()}
                  ref={menuRef}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      setMenuOpenId(
                        menuOpenId === plant.id ? null : plant.id
                      );
                    }}
                    className="
                      w-10 h-10
                      rounded-xl
                      bg-white/5
                      border border-white/10
                      flex items-center justify-center
                      hover:bg-white/10
                      transition-all
                    "
                  >
                    <span className="material-symbols-outlined text-gray-300">
                      more_vert
                    </span>
                  </button>

                  {menuOpenId === plant.id && (
                    <div
                      className="
                        absolute right-0 mt-2 w-44
                        rounded-2xl
                        border border-white/10
                        bg-[#121826]
                        backdrop-blur-xl
                        shadow-2xl
                        overflow-hidden
                      "
                    >
                      <button
                        onClick={() => {
                          openEditModal(plant);
                          setMenuOpenId(null);
                        }}
                        className="
                          w-full
                          flex items-center gap-3
                          px-4 py-3
                          hover:bg-white/5
                          transition-all
                          text-sm
                        "
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          edit
                        </span>

                        Edit Plant
                      </button>

                      <button
                        onClick={() => {
                          handleDeletePlant(plant);
                          setMenuOpenId(null);
                        }}
                        className="
                          w-full
                          flex items-center gap-3
                          px-4 py-3
                          hover:bg-red-500/10
                          text-red-300
                          transition-all
                          text-sm
                        "
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          delete
                        </span>

                        Delete Plant
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-300 text-[28px]">
                      floor
                    </span>
                  </div>

                  <div className="flex items-center mt-14 gap-2 text-xs text-emerald-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-2">
                  {plant.name}
                </h2>

                <p className="text-gray-400 text-sm min-h-[60px]">
                  {plant.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div
            className="
              w-full max-w-2xl
              rounded-3xl
              border border-white/10
              bg-[#121826]/95
              backdrop-blur-2xl
              shadow-[0_0_80px_rgba(0,0,0,0.45)]
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  {editingPlant ? "Edit Plant" : "Create New Plant"}
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  Configure industrial environment blueprint
                </p>
              </div>

              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-3xl">
                  close
                </span>
              </button>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 mb-2 block">
                  Plant Name
                </label>

                <input
                  type="text"
                  placeholder="Main Campus"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="
                    w-full
                    bg-white/5
                    border border-white/10
                    rounded-2xl
                    px-4 py-3
                    outline-none
                    focus:border-blue-400/40
                    transition-all
                  "
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 mb-2 block">
                  Description
                </label>

                <textarea
                  placeholder="Industrial monitoring environment..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="
                    w-full
                    h-28
                    resize-none
                    bg-white/5
                    border border-white/10
                    rounded-2xl
                    px-4 py-3
                    outline-none
                    focus:border-blue-400/40
                  "
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-white/5 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="
                  px-5 py-3
                  rounded-2xl
                  border border-white/10
                  text-gray-300
                  hover:bg-white/5
                  transition-all
                "
              >
                Cancel
              </button>

              <button
                onClick={handleSavePlant}
                disabled={creating}
                className="
                  px-6 py-3
                  rounded-2xl
                  bg-blue-500
                  hover:bg-blue-400
                  transition-all
                  shadow-[0_0_25px_rgba(59,130,246,0.25)]
                  flex items-center gap-2
                  disabled:opacity-50
                "
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">
                      {editingPlant ? "save" : "add"}
                    </span>

                    {editingPlant ? "Save Changes" : "Create Plant"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalOpen && selectedPlant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div
            className="
              relative
              w-full max-w-md
              rounded-3xl
              border border-red-500/20
              bg-[#121826]/95
              backdrop-blur-2xl
              shadow-[0_0_80px_rgba(239,68,68,0.15)]
              overflow-hidden
              animate-[fadeIn_.2s_ease]
            "
          >
            {/* Glow */}
            <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-red-500/10 blur-[80px] rounded-full" />

            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 border-b border-white/5">
              <div className="flex items-start gap-4">
                <div
                  className="
                    min-w-[60px]
                    h-[60px]
                    rounded-2xl
                    bg-red-500/10
                    border border-red-500/20
                    flex items-center justify-center
                  "
                >
                  <span className="material-symbols-outlined text-red-300 text-[30px]">
                    delete
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Delete Plant
                  </h2>

                  <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                    You are about to permanently remove{" "}
                    <span className="text-white font-medium">
                      {selectedPlant.name}
                    </span>.
                    <br />
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex justify-end gap-4">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedPlant(null);
                }}
                className="
                  px-5 py-3
                  rounded-2xl
                  border border-white/10
                  text-gray-300
                  hover:bg-white/5
                  transition-all
                "
              >
                Cancel
              </button>

              <button
                onClick={confirmDeletePlant}
                className="
                  px-6 py-3
                  rounded-2xl
                  bg-red-500
                  hover:bg-red-400
                  transition-all
                  shadow-[0_0_30px_rgba(239,68,68,0.25)]
                  flex items-center gap-2
                "
              >
                <span className="material-symbols-outlined text-[20px]">
                  delete_forever
                </span>

                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantsPage;