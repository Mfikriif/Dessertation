export const withPolling = (apiFunction, defaultInterval = 5000) => {
  return (callback, ...args) => {
    let isMounted = true;
    let intervalId = null;
    
    const fetch = async () => {
      try {
        console.log(`[Polling] Mengambil data pembaruan...`);
        // Force timestamp untuk mencegah cache browser yang agresif
        const response = await apiFunction(...args, { params: { _t: new Date().getTime() } });
        if (isMounted) {
          callback(null, response);
        }
      } catch (error) {
        if (isMounted) {
          callback(error, null);
        }
      }
    };

    fetch(); // Eksekusi pertama kali

    intervalId = setInterval(fetch, defaultInterval);

    // Memicu fetch langsung saat user kembali melihat tab ini (karena setInterval di-pause browser saat tab di background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        console.log(`[Polling] Tab aktif kembali, melakukan fetch segera...`);
        fetch();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Kembalikan fungsi cleanup untuk memberhentikan polling saat komponen di-unmount
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  };
};
