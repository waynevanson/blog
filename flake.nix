{
  description = "Wayne Van Son's blog";

  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
      # Pin the Node.js version used by both the package build and the dev
      # shell. Astro requires >=22.23.4, so use the current LTS line.
      nodejs = pkgs.nodejs_24;
    in
    {
      packages.${system}.default = pkgs.buildNpmPackage {
        pname = "waynevanson-blog";
        version = "0.1.0";

        src = ./.;
        inherit nodejs;
        npmDepsHash = "sha256-K5Us7Cy14fmVdPyV+NhCXjnK7K+2pjsj2CAmOBy3hdg=";

        # Build-only tooling (types, astro check) is not needed at runtime.
        npmInstallFlags = [ "--omit=dev" ];

        buildPhase = ''
          runHook preBuild
          npm run build
          runHook postBuild
        '';

        installPhase = ''
          runHook preInstall

          mkdir -p $out/share/blog
          cp -r dist node_modules package.json keystatic.config.ts $out/share/blog/

          runHook postInstall
        '';

        meta = {
          description = "Astro + Keystatic blog served on the home server";
          mainProgram = "blog";
        };
      };

      devShells.${system}.default = pkgs.mkShell {
        packages = [
          nodejs
          pkgs.git
        ];
      };
    };
}
