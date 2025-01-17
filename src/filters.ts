import * as semver from "semver"
import {MigrationMode} from "./settings"

const logger = require('pino')()

export function filterSourceVersions(packageName: string,
                                     sourcePackument: Record<string, any>,
                                     migrationMode: MigrationMode) {
  const allSourceVersions = sourcePackument ? (sourcePackument.versions ? Object.keys(sourcePackument.versions) : []) : []
  logger.debug(`[${packageName}] source versions: ${allSourceVersions}`)

  let filteredSourceVersions = []
  if (migrationMode === MigrationMode.ALL) {
    filteredSourceVersions = allSourceVersions
  } else if (migrationMode === MigrationMode.ONLY_LATEST && sourcePackument != null) {
    filteredSourceVersions = [sourcePackument['dist-tags'].latest]
  } else if (migrationMode === MigrationMode.LATEST_MAJORS && allSourceVersions.length !== 0) {
    filteredSourceVersions = getLatestMajorVersions(allSourceVersions);
  }
  return filteredSourceVersions
}

function getLatestMajorVersions(srcVersionsRaw: string[]) {
  const majorVersions = srcVersionsRaw.filter(version => {
    const semverInstance = new semver.SemVer(version)
    return semverInstance.prerelease.length === 0
  })

  return Array.from(semver.rsort(majorVersions).reduce((acc, version) => {
    const semverInstance = new semver.SemVer(version)

    if (semverInstance.major === 0 && semverInstance.minor === 0) {
      acc.set(version, version)
    } else if (semverInstance.major === 0) {
      const key = `${semverInstance.major}.${semverInstance.minor}`
      if (!acc.has(key)) acc.set(key, version.toString())
    } else if (!acc.has(semverInstance.major)) {
      acc.set(semverInstance.major, version.toString())
    }

    return acc;
  }, new Map).values()).reverse() as string[]
}