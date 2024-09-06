import prisma from "@/server/prisma";
import { getLocalTimeZone, type DateValue } from "@internationalized/date";

export function checkDate(date : DateValue) {
	const startOfDay = date.toDate(getLocalTimeZone());
	startOfDay.setHours(0, 0, 0, 0);

	// Crée une date pour la fin de la journée (23:59:59)
	const endOfDay = new Date(startOfDay);
	endOfDay.setHours(23, 59, 59, 999);

	let events = prisma.slot.findMany({
		where: {
			starts_at: {
				gte: startOfDay,  // greater than or equal to start of day
				lt: endOfDay      // less than end of day
			}
		}
	});

	events.then((res) => {
		if (res.length > 0) {
			return true;
		}
	});
}