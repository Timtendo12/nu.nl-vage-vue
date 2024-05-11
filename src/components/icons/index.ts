import IconBell from './IconBell.vue';
import IconCaretDown from './IconCaretDown.vue';
import IconCars from './IconCars.vue';
import IconCheck from './IconCheck.vue';
import IconChevronRight from './IconChevronRight.vue';
import IconChevronSolidRight from './IconChevronSolidRight.vue';
import IconComment from './IconComment.vue';
import IconDarkMode from './IconDarkMode.vue';
import IconEyeClosed from './IconEyeClosed.vue';
import IconEyeOpen from './IconEyeOpen.vue';
import IconFacebook from './IconFacebook.vue';
import IconFootball from './IconFootball.vue';
import IconGames from './IconGames.vue';
import IconInfo from './IconInfo.vue';
import IconInstagram from './IconInstagram.vue';
import IconLinkedin from './IconLinkedin.vue';
import IconLoading from './IconLoading.vue';
import IconLogoNu from './IconLogoNu.vue';
import IconLogoNu25Year from './IconLogoNu25Year.vue';
import IconMegaphone from './IconMegaphone.vue';
import IconPinOutline from './IconPinOutline.vue';
import IconPinSolid from './IconPinSolid.vue';
import IconPlay from './IconPlay.vue';
import IconPlus from './IconPlus.vue';
import IconQuestion from './IconQuestion.vue';
import IconRSS from './IconRSS.vue';
import IconShare from './IconShare.vue';
import IconStocks from './IconStocks.vue';
import IconThumbsUp from './IconThumbsUp.vue';
import IconTv from './IconTv.vue';
import IconUser from './IconUser.vue';
import IconWeather from './IconWeather.vue';
import IconWhatsapp from './IconWhatsapp.vue';
import IconX from './IconX.vue';
import IconWeatherA from './weather/IconWeatherA.vue';
import IconWeatherAa from './weather/IconWeatherAA.vue';
import IconWeatherB from './weather/IconWeatherB.vue';
import IconWeatherBb from './weather/IconWeatherBB.vue';
import IconWeatherC from './weather/IconWeatherC.vue';
import IconWeatherCc from './weather/IconWeatherCC.vue';
import IconWeatherD from './weather/IconWeatherD.vue';
import IconWeatherDd from './weather/IconWeatherDD.vue';
import IconWeatherE from './weather/IconWeatherE.vue';
import IconWeatherEe from './weather/IconWeatherEE.vue';
import IconWeatherF from './weather/IconWeatherF.vue';
import IconWeatherFf from './weather/IconWeatherFF.vue';
import IconWeatherG from './weather/IconWeatherG.vue';
import IconWeatherGg from './weather/IconWeatherGG.vue';
import IconWeatherH from './weather/IconWeatherH.vue';
import IconWeatherHh from './weather/IconWeatherHH.vue';
import IconWeatherI from './weather/IconWeatherI.vue';
import IconWeatherIi from './weather/IconWeatherII.vue';
import IconWeatherJ from './weather/IconWeatherJ.vue';
import IconWeatherJj from './weather/IconWeatherJJ.vue';
import IconWeatherK from './weather/IconWeatherK.vue';
import IconWeatherKk from './weather/IconWeatherKK.vue';
import IconWeatherL from './weather/IconWeatherL.vue';
import IconWeatherLl from './weather/IconWeatherLL.vue';
import IconWeatherM from './weather/IconWeatherM.vue';
import IconWeatherMm from './weather/IconWeatherMM.vue';
import IconWeatherN from './weather/IconWeatherN.vue';
import IconWeatherNn from './weather/IconWeatherNN.vue';
import IconWeatherO from './weather/IconWeatherO.vue';
import IconWeatherOo from './weather/IconWeatherOO.vue';
import IconWeatherP from './weather/IconWeatherP.vue';
import IconWeatherPp from './weather/IconWeatherPP.vue';
import IconWeatherQ from './weather/IconWeatherQ.vue';
import IconWeatherQq from './weather/IconWeatherQQ.vue';
import IconWeatherR from './weather/IconWeatherR.vue';
import IconWeatherRr from './weather/IconWeatherRR.vue';
import IconWeatherT from './weather/IconWeatherT.vue';
import IconWeatherTt from './weather/IconWeatherTT.vue';

export {
  IconBell,
  IconCaretDown,
  IconCars,
  IconCheck,
  IconChevronRight,
  IconChevronSolidRight,
  IconComment,
  IconDarkMode,
  IconEyeClosed,
  IconEyeOpen,
  IconFacebook,
  IconFootball,
  IconGames,
  IconInfo,
  IconInstagram,
  IconLinkedin,
  IconLoading,
  IconLogoNu,
  IconLogoNu25Year,
  IconMegaphone,
  IconPinOutline,
  IconPinSolid,
  IconPlay,
  IconPlus,
  IconQuestion,
  IconRSS,
  IconShare,
  IconStocks,
  IconThumbsUp,
  IconTv,
  IconUser,
  IconWeather,
  IconWeatherA,
  IconWeatherAa,
  IconWeatherB,
  IconWeatherBb,
  IconWeatherC,
  IconWeatherCc,
  IconWeatherD,
  IconWeatherDd,
  IconWeatherE,
  IconWeatherEe,
  IconWeatherF,
  IconWeatherFf,
  IconWeatherG,
  IconWeatherGg,
  IconWeatherH,
  IconWeatherHh,
  IconWeatherI,
  IconWeatherIi,
  IconWeatherJ,
  IconWeatherJj,
  IconWeatherK,
  IconWeatherKk,
  IconWeatherL,
  IconWeatherLl,
  IconWeatherM,
  IconWeatherMm,
  IconWeatherN,
  IconWeatherNn,
  IconWeatherO,
  IconWeatherOo,
  IconWeatherP,
  IconWeatherPp,
  IconWeatherQ,
  IconWeatherQq,
  IconWeatherR,
  IconWeatherRr,
  IconWeatherT,
  IconWeatherTt,
  IconWhatsapp,
  IconX,
};

export const mapPerfApiIcon = (iconName?: string | null) => {
  if (!iconName) {
    return null;
  }
  try {
    const splitted = iconName.split('_');
    return `${splitted[1]}-${splitted[0]}`;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const mapGraphicIcon = (iconName?: string | null) => {
  if (!iconName) {
    return null;
  }
  try {
    const replaced = iconName.replace('_', '-');
    return `icon-${replaced.toLowerCase()}`;
  } catch (e) {
    console.error(e);
    return null;
  }
};
