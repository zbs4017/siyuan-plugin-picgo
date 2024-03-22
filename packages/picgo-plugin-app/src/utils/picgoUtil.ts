/*
 *            GNU GENERAL PUBLIC LICENSE
 *               Version 3, 29 June 2007
 *
 *  Copyright (C) 2024 Terwer, Inc. <https://terwer.space/>
 *  Everyone is permitted to copy and distribute verbatim copies
 *  of this license document, but changing it is not allowed.
 */

import _ from "lodash-es"
import { IConfig, IPicGo } from "zhi-siyuan-picgo"
import { trimValues } from "@/utils/utils.ts"
import IdUtil from "@/utils/idUtil.ts"

/**
 * picgo 工具类
 *
 * @version 1.6.0
 * @since 1.6.0
 * @author terwer
 */
class PicgoUtil {
  /**
   * 根据 key 获取配置项
   *
   * @param cfg
   * @param key
   * @param defaultValue
   */
  public static getPicgoConfig(cfg: IConfig, key?: string, defaultValue?: any) {
    if (!key) {
      return cfg as unknown
    }
    return _.get(cfg, key, defaultValue)
  }

  /**
   * 保存配置
   *
   * @param ctx
   * @param cfg
   */
  public static savePicgoConfig(ctx: IPicGo, cfg: Partial<IConfig>) {
    if (!ctx || !cfg || !ctx.saveConfig) {
      console.warn(`ctx or cfg is undefined, ctx: ${ctx} => cfg: ${cfg}  `)
      return
    }
    console.log("ctx savePicgoConfig in PicgoUtil", cfg)
    ctx.saveConfig(cfg)
  }

  /**
   * 获取可用的图床列表
   *
   * @param cfg
   */
  public static getPicBeds(cfg: IConfig) {
    const picBeds = this.getPicgoConfig(cfg, "picBed.list", []) as IPicBedType[]

    const showPicBedList = picBeds
      .map((item: IPicBedType) => {
        if (item.visible) {
          return item
        }
        return null
      })
      .filter((item) => item)
      .sort((a: any) => {
        if (a.type === "smms") {
          return -1
        }
        return 0
      }) as IPicBedType[]

    return {
      picBeds,
      showPicBedList,
    }
  }

  public static getUploaderConfigList(ctx: IPicGo, cfg: IConfig, type: string): IUploaderConfigItem {
    if (!type) {
      return {
        configList: [] as IUploaderConfigListItem[],
        defaultId: "",
      }
    }
    const currentUploaderConfig = this.getPicgoConfig(cfg, `uploader.${type}`) ?? {}
    let configList = currentUploaderConfig.configList
    let defaultId = currentUploaderConfig.defaultId || ""
    if (!configList) {
      const res = this.upgradeUploaderConfig(ctx, cfg, type)
      configList = res.configList
      defaultId = res.defaultId
    }

    const configItem = {
      configList,
      defaultId,
    }
    // console.warn("获取当前图床配置列表：", configItem)
    return configItem
  }

  /**
   * upgrade old uploader config to new format
   *
   * @param ctx
   * @param cfg
   * @param type type
   * @author terwer
   * @since 0.7.0
   */
  private static upgradeUploaderConfig = (ctx: IPicGo, cfg: IConfig, type: string) => {
    const uploaderConfig = this.getPicgoConfig(cfg, `picBed.${type}`) ?? {}
    if (!uploaderConfig._id) {
      Object.assign(uploaderConfig, this.completeUploaderMetaConfig(uploaderConfig))
    }

    const uploaderConfigList = [uploaderConfig]
    this.savePicgoConfig(ctx, {
      [`uploader.${type}`]: {
        configList: uploaderConfigList,
        defaultId: uploaderConfig._id,
      },
      [`picBed.${type}`]: uploaderConfig,
    })
    return {
      configList: uploaderConfigList as IUploaderConfigListItem[],
      defaultId: uploaderConfig._id as string,
    }
  }

  /**
   * 增加配置元数据
   *
   * @param originData 原始数据
   */
  private static completeUploaderMetaConfig(originData: any) {
    return Object.assign(
      {
        _configName: "Default",
      },
      trimValues(originData),
      {
        _id: IdUtil.newUuid(),
        _createdAt: Date.now(),
        _updatedAt: Date.now(),
      }
    )
  }
}

export { PicgoUtil }
