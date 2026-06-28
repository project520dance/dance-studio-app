type DancerAvatarProps = {
  name: string;
  photoUrl: string | null;
  size?: "small" | "large";
};

export function DancerAvatar({
  name,
  photoUrl,
  size = "small",
}: DancerAvatarProps) {
  const sizeClass = size === "large" ? "size-20" : "size-11";

  return (
    <div
      role="img"
      aria-label={`${name} profile photo`}
      className={`flex items-center justify-center rounded-xl bg-pink-100 bg-cover bg-center text-xl ${sizeClass}`}
      style={
        photoUrl
          ? { backgroundImage: `url("${photoUrl}")` }
          : undefined
      }
    >
      {!photoUrl && <span aria-hidden="true">🩰</span>}
    </div>
  );
}
