export function loadScript(src: string) {
  return new Promise((resolve: any) => {
    const script = document.createElement('script');
    function onLoaded(err?: Error) {
      if (script.parentElement) {
        script.parentElement.removeChild(script);
      }
      resolve(err);
    }
    script.src = src;
    script.onload = () => onLoaded();

    script.onerror = () => {
      const error = new Error(`Failed to load ${src}`);
      // eslint-disable-next-line no-console
      console.error(error);
      onLoaded(error);
    };

    document.head.appendChild(script);
  });
}
