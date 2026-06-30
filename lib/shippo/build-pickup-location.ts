import "server-only"

import {
  BuildingLocationType,
  BuildingType,
  type Location,
} from "shippo/models/components"

import { getShipFromAddress } from "@/lib/shippo/ship-from"

/** Shippo pickup location for the Ontario store. */
export function buildShippoPickupLocation(instructions?: string): Location {
  const from = getShipFromAddress()
  const trimmedInstructions = instructions?.trim()

  return {
    buildingLocationType: BuildingLocationType.FrontDoor,
    buildingType: BuildingType.Building,
    instructions: trimmedInstructions || undefined,
    address: {
      name: from.name,
      company: from.company,
      street1: from.street1,
      city: from.city,
      state: from.state,
      zip: from.zip,
      country: from.country,
      phone: from.phone,
      email: from.email,
    },
  }
}
