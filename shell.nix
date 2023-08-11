let pkgs = import <nixpkgs> {};
in pkgs.mkShell rec {
  name = "mermaid-editor";
  buildInputs = with pkgs; [
    nodejs-18_x
    (yarn.override { nodejs = nodejs-18_x; })
    nodePackages.typescript-language-server
    nodePackages.prettier
  ];
}
