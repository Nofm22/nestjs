import moment from 'moment';
export const convertTimeStamp = (value?: Date | null) =>
  !!value ? new Date(value).getTime() : 0;

export const formatTime = (value: Date | null) =>
  !!value ? moment(value).format('hh:mm A') : 0;

export const messageTimeDisplayChatRoom = (createdAt) => {
  let displayTime = '';
  const duration = moment.duration(moment(new Date()).diff(createdAt));
  let hours = duration.asHours();
  if (hours < 1) {
    let minutes = Math.floor((hours * 3600) / 60);
    if (minutes === 0) {
      minutes++;
    }
    displayTime = `${minutes} phút`;
  } else if (hours >= 1 && hours < 24) {
    const hour = Math.floor(hours);
    displayTime = `${hour} giờ`;
  } else if (hours >= 24 && hours < 168) {
    const weekday = moment(createdAt).weekday();

    if (weekday === 0) {
      displayTime = 'CN';
    } else {
      displayTime = 'T' + (weekday + 1);
    }
  } else if (hours >= 168 && hours < 8760) {
    displayTime = moment(new Date(createdAt)).format('DD/MM');
  } else {
    displayTime = moment(new Date(createdAt)).format('DD/MM/YY');
  }

  return displayTime;
};
