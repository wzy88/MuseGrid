DELETE FROM "ContributionRecord"
WHERE "id" NOT IN (
    SELECT MIN("id")
    FROM "ContributionRecord"
    GROUP BY "projectId", "stepType", "avatarId"
);

CREATE UNIQUE INDEX "ContributionRecord_projectId_stepType_avatarId_key" ON "ContributionRecord"("projectId", "stepType", "avatarId");
