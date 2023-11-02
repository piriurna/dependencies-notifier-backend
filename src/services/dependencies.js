const Dependency = require('../models/dependency');
const User = require('../models/user');
const axios = require('axios');
const Project = require('../models/project');


async function checkAndUpdateLatestVersions() {
  // Fetch all the dependencies from the database
  const dependencies = await Dependency.find({});

  for (let dependency of dependencies) {
      try {
          // Extract the latest version
          const latestVersion = getLatestVersionFromSource(dependency.group, dependency.name);

          if (latestVersion) {
              // Update the latest version if it is greater than the existing one
              if (isNewerVersion(dependency.latestVersion, latestVersion)) {
                  dependency.latestVersion = latestVersion;
                  await dependency.save();
              }
          } else {
              // If latestVersion is null or not present, delete the dependency from the database
              await Dependency.findByIdAndDelete(dependency._id);
          }

      } catch (error) {
          console.error(`Failed to fetch version for ${dependency.group}:${dependency.name}`, error);
      }
  }
}


    /**
     * Updates the project's dependencies and adds/updates them in the Dependency collection.
     * @param {String} projectId - The ID of the project.
     * @param {Array} dependencies - List of parsed dependencies from the project's dependencies.gradle.
     */
    async function updateProjectDependencies(projectId, dependencies) {
    // Iterate over each dependency
    for (let dep of dependencies) {
        // Check if the dependency exists in the Dependency collection
        let dependency = await Dependency.findOne({
            group: dep.group,
            name: dep.name
        });

        // If it doesn't exist, add to Dependency collection
        if (!dependency) {
            dependency = new Dependency({
                group: dep.group,
                name: dep.name,
                latestVersion: dep.version, // Temporarily set user's version as the latest. This should be updated from Maven or similar sources.
                projectsInterested: [projectId]
            });
            await dependency.save();
        } else {
            // If the project isn't already associated with this dependency, add it
            if (!dependency.projectsInterested.includes(projectId)) {
                dependency.projectsInterested.push(projectId);
                await dependency.save();
            }
        }
    }

  // Find the project and update its dependencies
  const project = await Project.findById(projectId);
  if (project) {
      project.dependencies = dependencies;
      await project.save();
  }
  // TODO: Handle the case where the provided projectId might not be valid.
}
/**
 * Placeholder function to fetch the latest version of a dependency from a source.
 * This should be replaced with actual code that fetches the version from Maven or a similar source.
 * @param {String} group - The group of the dependency.
 * @param {String} name - The name of the dependency.
 */
async function getLatestVersionFromSource(group, name) {
  try {
      const query = `g:${group} AND a:${name}`;
      const apiUrl = `https://search.maven.org/solrsearch/select?q=${encodeURIComponent(query)}&rows=1&wt=json`;
      console.log(apiUrl)
      const response = await axios.get(apiUrl);
      const data = response.data;

      return data.response.docs[0].latestVersion;
  } catch (error) {
      console.error("Error fetching latest version:", error);
      return null;
  }
}

async function addOrUpdateDependency(projectId, group, name, currentVersion) {
    // Check if the dependency already exists
    let dependency = await Dependency.findOne({ group, name });
    const latestVersion = await getLatestVersionFromSource(group, name);

    if (dependency) {
        // If the dependency exists, update the version if there's a newer version
        if (latestVersion && isNewerVersion(dependency.latestVersion, latestVersion)) {
            dependency.latestVersion = latestVersion;
            await dependency.save();
        }
    } else {
        // If the dependency doesn't exist, create a new one
        const versionToUse = latestVersion || currentVersion;
        dependency = new Dependency({
            group: group,
            name: name,
            latestVersion: versionToUse,
            projectsInterested: [projectId]
        });
        await dependency.save();
    }

    // Update the project's dependencies
    const project = await Project.findById(projectId);
    const projectDependency = {
        dependency: dependency._id,
        currentVersion: currentVersion
    };
    project.dependencies.push(projectDependency);
    await project.save();

    return dependency;
}


module.exports = {
  addOrUpdateDependency,
  checkAndUpdateLatestVersions,
  updateProjectDependencies
};
