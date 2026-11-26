function visibleAssignments(cycle) {
  const selected = cycle.activePublicationId ??
    (cycle.status === "PLANNED" ? cycle.latestPublicationId : null);
  return {
    cycleId: cycle._id,
    publicationId: selected ?? { $exists: false },
  };
}

module.exports = { visibleAssignments };
