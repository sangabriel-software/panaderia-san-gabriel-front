import dayjs from "dayjs";

export const currentDate = () => {
    return dayjs().format("YYYY-MM-DD");
}