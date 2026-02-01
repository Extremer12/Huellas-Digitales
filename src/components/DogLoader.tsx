const DogLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="main">
        <div className="dog">
          <div className="dog__paws">
            <div className="dog__bl-leg leg">
              <div className="dog__bl-paw paw"></div>
              <div className="dog__bl-top top"></div>
            </div>
            <div className="dog__fl-leg leg">
              <div className="dog__fl-paw paw"></div>
              <div className="dog__fl-top top"></div>
            </div>
            <div className="dog__fr-leg leg">
              <div className="dog__fr-paw paw"></div>
              <div className="dog__fr-top top"></div>
            </div>
          </div>

          <div className="dog__body">
            <div className="dog__tail"></div>
          </div>

          <div className="dog__head">
            <div className="dog__snout">
              <div className="dog__eyes">
                <div className="dog__eye-l"></div>
                <div className="dog__eye-r"></div>
              </div>
            </div>
          </div>

          <div className="dog__head-c">
            <div className="dog__ear-r"></div>
            <div className="dog__ear-l"></div>
          </div>
        </div>
      </div>

      <h1 className="mt-8 text-2xl font-bold text-primary">Huellas Digitales</h1>
      
      <div className="mt-6 w-64 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-loading-bar"></div>
      </div>
      
      <p className="mt-3 text-sm text-muted-foreground">Cargando...</p>
    </div>
  );
};

export default DogLoader;
