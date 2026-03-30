const UtilityService = {
  isDev: () => (process.argv[2] === 'DEV'),
  platform: () => process.platform
}

export default UtilityService;