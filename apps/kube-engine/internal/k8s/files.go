package k8s

import (
	"context"
	"strconv"
	"strings"
	"time"
	"fmt"
)

type FileEntry struct {
	Name           string
	Kind           string // "file" | "folder" | "symlink" | "other"
	Size           int64
	Permissions    string
	Owner          string
	ModifiedAt     time.Time // set when we got a parseable Unix timestamp (GNU ls)
	ModifiedAtRaw  string    // always set — raw text from ls, fallback for BusyBox
}

// ListFiles execs into a container and returns a parsed directory listing for path.
// ListFiles execs into a container and returns a parsed directory listing for path.
func ListFiles(ctx context.Context, kubeconfigPath, contextName, namespace, pod, container, path string) ([]FileEntry, error) {
	stdout, stderr, err := ExecCommand(
		ctx, kubeconfigPath, contextName, namespace, pod, container,
		[]string{"ls", "-la", "--time-style=+%s", path},
	)

	if err != nil {
		if strings.Contains(stderr, "unrecognized option") || strings.Contains(stderr, "invalid option") {
			// BusyBox (or another minimal ls) — retry without the GNU-only flag.
			stdout, stderr, err = ExecCommand(
				ctx, kubeconfigPath, contextName, namespace, pod, container,
				[]string{"ls", "-la", path},
			)
			if err != nil {
				return nil, wrapExecError(err, stderr)
			}
			return parseLsOutputPortable(stdout), nil
		}
		return nil, wrapExecError(err, stderr)
	}

	return parseLsOutputUnixTime(stdout), nil
}

func wrapExecError(err error, stderr string) error {
	if stderr != "" {
		return fmt.Errorf("%w: %s", err, strings.TrimSpace(stderr))
	}
	return err
}

// parseLsOutput parses GNU coreutils `ls -la --time-style=+%s` output.
// parseLsOutputUnixTime parses `ls -la --time-style=+%s` output (GNU coreutils).
func parseLsOutputUnixTime(raw string) []FileEntry {
	lines := strings.Split(raw, "\n")
	var entries []FileEntry

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "total ") {
			continue
		}

		fields := strings.Fields(line)
		if len(fields) < 7 {
			continue
		}

		perms := fields[0]
		owner := fields[2]
		sizeStr := fields[4]
		mtimeStr := fields[5]
		name := strings.Join(fields[6:], " ")

		if name == "." || name == ".." {
			continue
		}

		size, _ := strconv.ParseInt(sizeStr, 10, 64)
		mtimeUnix, _ := strconv.ParseInt(mtimeStr, 10, 64)

		entries = append(entries, FileEntry{
			Name:          name,
			Kind:          kindFromPerms(perms),
			Size:          size,
			Permissions:   perms,
			Owner:         owner,
			ModifiedAt:    time.Unix(mtimeUnix, 0),
			ModifiedAtRaw: time.Unix(mtimeUnix, 0).Format(time.RFC3339),
		})
	}

	return entries
}

// parseLsOutputPortable parses plain `ls -la` output (BusyBox or other minimal ls,
// no --time-style support). Modified time is kept as raw text only — column count
// is the same (3 date tokens) whether it's "Jun 27 06:26" or "Aug 7 2023", so we
// don't actually need to tell those apart to display something useful.
func parseLsOutputPortable(raw string) []FileEntry {
	lines := strings.Split(raw, "\n")
	var entries []FileEntry

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "total ") {
			continue
		}

		fields := strings.Fields(line)
		// perms links owner group size month day time/year name...
		if len(fields) < 9 {
			continue
		}

		perms := fields[0]
		owner := fields[2]
		sizeStr := fields[4]
		mtimeRaw := strings.Join(fields[5:8], " ") // e.g. "Jun 27 06:26"
		name := strings.Join(fields[8:], " ")

		if name == "." || name == ".." {
			continue
		}

		size, _ := strconv.ParseInt(sizeStr, 10, 64)

		entries = append(entries, FileEntry{
			Name:          name,
			Kind:          kindFromPerms(perms),
			Size:          size,
			Permissions:   perms,
			Owner:         owner,
			ModifiedAt:    time.Time{}, // unknown/unparsed — zero value
			ModifiedAtRaw: mtimeRaw,
		})
	}

	return entries
}

func kindFromPerms(perms string) string {
	switch perms[0] {
	case 'd':
		return "folder"
	case 'l':
		return "symlink"
	default:
		return "file"
	}
}