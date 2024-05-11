export const formatDuration = (duration: number | undefined): string | undefined => {
  // Do not format video duration if less than 2 seconds
  // This is done to prevent showing pre-rolls on specific videos.
  // Freewheel is configured to check "vdur" and if this is below x amount of seconds: no pre-rolls are shown.
  if (duration && duration >= 2) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};
