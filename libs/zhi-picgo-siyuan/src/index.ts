import { simpleLogger, MainFunction } from "zhi-lib-base"

/**
 * 初始化入口
 *
 * @param args
 */
const main: MainFunction = async (args: any[]) => {
  const logger = simpleLogger("main", "zhi", false)
  logger.info(`main start ${args}`)
  return "ok"
}

export default main
